import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const createFundSchema = z.object({
  name: z.string().min(1),
  symbol: z.string().min(1),
  maxSupply: z.number().positive(),
  price: z.number().positive().optional()
});

const approvalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  fundWalletPublicKey: z.string().optional()
});

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    throw new Error('Invalid token');
  }
}

export async function fundRoutes(fastify: FastifyInstance) {
  // Create fund (Gestor only)
  fastify.post('/', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const payload = verifyToken(token);
      if (payload.role !== 'GESTOR' && payload.role !== 'CONSULTOR') {
        return reply.status(403).send({ error: 'Only gestors and consultors can create funds' });
      }

      // If it's a consultor, check if they are approved
      if (payload.role === 'CONSULTOR') {
        // Ensure payload.id is defined (the JWT contains 'id', not 'userId')
        if (!payload.id) {
          return reply.status(400).send({ error: 'Invalid token payload. Missing user ID.' });
        }
        
        const consultor = await fastify.prisma.user.findUnique({
          where: { id: payload.id }
        });
        
        if (!consultor || consultor.status !== 'APPROVED') {
          return reply.status(403).send({ error: 'Consultor must be approved to create funds' });
        }
      }

      const body = createFundSchema.parse(request.body);

      // Check if symbol already exists
      const existingFund = await fastify.prisma.fund.findUnique({
        where: { symbol: body.symbol }
      });

      if (existingFund) {
        return reply.status(400).send({ error: 'Symbol already exists' });
      }

      // Prepare fund data
      const fundData = {
        ...body,
        // Funds created by consultors start as PENDING, by gestors as APPROVED
        status: payload.role === 'CONSULTOR' ? 'PENDING' : 'APPROVED',
        // Associate consultor if applicable
        ...(payload.role === 'CONSULTOR' && { consultorId: payload.id })
      };

      const fund = await fastify.prisma.fund.create({
        data: fundData
      });

      return { fund };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // List funds
  fastify.get('/', async (request, reply) => {
    try {
      const funds = await fastify.prisma.fund.findMany({
        include: {
          consultor: {
            select: {
              email: true
            }
          },
          receivables: {
            select: {
              id: true,
              faceValue: true,
              status: true
            }
          },
          orders: {
            where: { status: 'COMPLETED' },
            select: {
              quantity: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const fundsWithMetrics = funds.map(fund => {
        const totalSold = fund.orders.reduce((sum, order) => sum + order.quantity, 0);
        const totalReceivables = fund.receivables.reduce((sum, rec) => sum + rec.faceValue, 0);
        
        return {
          ...fund,
          totalSold,
          totalReceivables,
          availableQuotas: fund.totalIssued - totalSold
        };
      });

      return { funds: fundsWithMetrics };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get fund by id
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const fund = await fastify.prisma.fund.findUnique({
        where: { id },
        include: {
          receivables: {
            include: {
              sacado: {
                select: { name: true, document: true }
              }
            }
          },
          orders: {
            where: { status: 'COMPLETED' },
            include: {
              investor: {
                select: { email: true, publicKey: true }
              }
            }
          }
        }
      });

      if (!fund) {
        return reply.status(404).send({ error: 'Fund not found' });
      }

      const totalSold = fund.orders.reduce((sum, order) => sum + order.quantity, 0);
      const totalReceivables = fund.receivables.reduce((sum, rec) => sum + rec.faceValue, 0);

      return {
        fund: {
          ...fund,
          totalSold,
          totalReceivables,
          availableQuotas: fund.totalIssued - totalSold
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update fund contract address (after Soroban deployment)
  fastify.patch('/:id/contract', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const payload = verifyToken(token);
      if (payload.role !== 'GESTOR') {
        return reply.status(403).send({ error: 'Only gestors can update contracts' });
      }

      const { id } = request.params as { id: string };
      const { contractAddress } = z.object({ contractAddress: z.string() }).parse(request.body);

      const fund = await fastify.prisma.fund.update({
        where: { id },
        data: { contractAddress }
      });

      return { fund };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Issue quotas (mint tokens) - Gestor only
  fastify.post('/:id/issue', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const payload = verifyToken(token);
      if (payload.role !== 'GESTOR') {
        return reply.status(403).send({ error: 'Only gestors can issue quotas' });
      }

      const { id } = request.params as { id: string };
      const { amount } = z.object({ amount: z.number().positive() }).parse(request.body);

      const fund = await fastify.prisma.fund.findUnique({ where: { id } });
      if (!fund) {
        return reply.status(404).send({ error: 'Fund not found' });
      }

      if (fund.totalIssued + amount > fund.maxSupply) {
        return reply.status(400).send({ error: 'Amount exceeds max supply' });
      }

      const updatedFund = await fastify.prisma.fund.update({
        where: { id },
        data: { totalIssued: fund.totalIssued + amount }
      });

      return { fund: updatedFund };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Approve/reject fund (Gestor only)
  fastify.patch('/:id/approval', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const user = verifyToken(token);
      const params = request.params as { id: string };
      
      if (user.role !== 'GESTOR') {
        return reply.status(403).send({ error: 'Access denied' });
      }

      const body = approvalSchema.parse(request.body);
      
      const fund = await fastify.prisma.fund.findUnique({
        where: { id: params.id }
      });

      if (!fund) {
        return reply.status(404).send({ error: 'Fund not found' });
      }

      // If approving, require fund wallet
      if (body.status === 'APPROVED' && !body.fundWalletPublicKey && !fund.fundWalletPublicKey) {
        return reply.status(400).send({ error: 'Fund wallet public key is required for approval' });
      }

      const updateData: any = { status: body.status };
      if (body.fundWalletPublicKey) {
        updateData.fundWalletPublicKey = body.fundWalletPublicKey;
      }

      const updatedFund = await fastify.prisma.fund.update({
        where: { id: params.id },
        data: updateData,
        include: {
          consultor: {
            select: {
              email: true
            }
          }
        }
      });

      return { fund: updatedFund };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Deactivate fund (Gestor only)
  fastify.patch('/:id/deactivate', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const user = verifyToken(token);
      const params = request.params as { id: string };
      
      if (user.role !== 'GESTOR') {
        return reply.status(403).send({ error: 'Access denied' });
      }
      
      const fund = await fastify.prisma.fund.findUnique({
        where: { id: params.id }
      });

      if (!fund) {
        return reply.status(404).send({ error: 'Fund not found' });
      }

      const updatedFund = await fastify.prisma.fund.update({
        where: { id: params.id },
        data: { status: 'CLOSED' },
        include: {
          consultor: {
            select: {
              email: true
            }
          }
        }
      });

      return { fund: updatedFund };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const createOrderSchema = z.object({
  fundId: z.string(),
  quantity: z.number().positive(),
  amount: z.number().positive().optional() // Optional amount, will calculate from fund price
});

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    throw new Error('Invalid token');
  }
}

export async function orderRoutes(fastify: FastifyInstance) {
  // Debug endpoint to check fund availability
  fastify.get('/debug/:fundId', async (request, reply) => {
    try {
      const { fundId } = request.params as { fundId: string };
      
      const fund = await fastify.prisma.fund.findUnique({
        where: { id: fundId },
        include: {
          orders: {
            where: { 
              status: { 
                in: ['COMPLETED', 'PENDING']
              } 
            },
            select: { quantity: true, status: true }
          }
        }
      });

      if (!fund) {
        return reply.status(404).send({ error: 'Fund not found' });
      }

      const totalSold = fund.orders.reduce((sum: number, order: any) => sum + order.quantity, 0);
      const availableQuotas = fund.totalIssued - totalSold;

      return {
        fund: {
          id: fund.id,
          name: fund.name,
          status: fund.status,
          totalIssued: fund.totalIssued,
          price: fund.price
        },
        orders: fund.orders,
        totalSold,
        availableQuotas
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create buy order with payment transaction (Investidor only)
  fastify.post('/', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const payload = verifyToken(token);
      if (payload.role !== 'INVESTIDOR') {
        return reply.status(403).send({ error: 'Only investors can create orders' });
      }

      const body = createOrderSchema.parse(request.body);

      // Check fund availability
      const fund = await fastify.prisma.fund.findUnique({
        where: { id: body.fundId },
        include: {
          orders: {
            where: { 
              status: { 
                in: ['COMPLETED', 'PENDING'] 
              } 
            },
            select: { quantity: true }
          }
        }
      });

      if (!fund) {
        return reply.status(404).send({ error: 'Fund not found' });
      }

      if (fund.status !== 'APPROVED') {
        return reply.status(400).send({ 
          error: 'Fund not available for investment',
          details: { fundStatus: fund.status }
        });
      }

      const totalSold = fund.orders.reduce((sum: number, order: any) => sum + order.quantity, 0);
      const availableQuotas = fund.totalIssued - totalSold;

      if (body.quantity > availableQuotas) {
        return reply.status(400).send({ 
          error: 'Not enough quotas available',
          details: {
            requested: body.quantity,
            available: availableQuotas,
            totalIssued: fund.totalIssued,
            totalSold: totalSold
          }
        });
      }

      const price = fund.price;
      const total = body.quantity * price;

      if (!fund.fundWalletPublicKey) {
        return reply.status(400).send({ error: 'Fund wallet not configured. Please contact the administrator.' });
      }

      // Create order in PENDING status
      const order = await fastify.prisma.order.create({
        data: {
          fundId: body.fundId,
          quantity: body.quantity,
          price: price,
          total,
          investorId: payload.id,
          status: 'PENDING'
        },
        include: {
          fund: {
            select: { name: true, symbol: true }
          },
          investor: {
            select: { email: true, publicKey: true }
          }
        }
      });

      return { 
        order,
        payment: {
          destination: fund.fundWalletPublicKey,
          amount: total.toString(),
          memo: order.id.substring(0, 28) // Stellar memo limit is 28 bytes
        }
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // List orders
  fastify.get('/', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const payload = verifyToken(token);

      // Investors see only their orders, Gestors see all
      const where = payload.role === 'INVESTIDOR' 
        ? { investorId: payload.id }
        : {};

      const orders = await fastify.prisma.order.findMany({
        where,
        include: {
          fund: {
            select: { name: true, symbol: true }
          },
          investor: {
            select: { email: true, publicKey: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { orders };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Complete order (mark as completed with tx hash)
  fastify.patch('/:id/complete', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const { id } = request.params as { id: string };
      const { txHash } = z.object({ txHash: z.string() }).parse(request.body);

      const order = await fastify.prisma.order.update({
        where: { id },
        data: { 
          status: 'COMPLETED',
          txHash 
        },
        include: {
          fund: {
            select: { name: true, symbol: true }
          },
          investor: {
            select: { email: true, publicKey: true }
          }
        }
      });

      return { order };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Cancel order
  fastify.patch('/:id/cancel', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const payload = verifyToken(token);
      const { id } = request.params as { id: string };

      // Find order
      const existingOrder = await fastify.prisma.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        return reply.status(404).send({ error: 'Order not found' });
      }

      // Check ownership
      if (payload.role === 'INVESTIDOR' && existingOrder.investorId !== payload.id) {
        return reply.status(403).send({ error: 'You can only cancel your own orders' });
      }

      if (existingOrder.status !== 'PENDING') {
        return reply.status(400).send({ error: 'Only pending orders can be canceled' });
      }

      const order = await fastify.prisma.order.update({
        where: { id },
        data: { status: 'FAILED' },
        include: {
          fund: {
            select: { name: true, symbol: true }
          },
          investor: {
            select: { email: true, publicKey: true }
          }
        }
      });

      return { order };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update order status (Gestor only)
  fastify.patch('/:id/status', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const payload = verifyToken(token);
      if (payload.role !== 'GESTOR') {
        return reply.status(403).send({ error: 'Only gestors can update order status' });
      }

      const { id } = request.params as { id: string };
      const { status } = z.object({ 
        status: z.enum(['PENDING', 'COMPLETED', 'FAILED']) 
      }).parse(request.body);

      const order = await fastify.prisma.order.update({
        where: { id },
        data: { status },
        include: {
          fund: {
            select: { name: true, symbol: true }
          },
          investor: {
            select: { email: true, publicKey: true }
          }
        }
      });

      return { order };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Approve or reject order (Gestor only) - with automatic refund on rejection
  fastify.patch('/:id/approve', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const payload = verifyToken(token);
      if (payload.role !== 'GESTOR') {
        return reply.status(403).send({ error: 'Only gestors can approve orders' });
      }

      const { id } = request.params as { id: string };
      const { action, refundTxHash } = z.object({ 
        action: z.enum(['approve', 'reject']),
        refundTxHash: z.string().optional()
      }).parse(request.body);

      // Get order with fund and investor details
      const existingOrder = await fastify.prisma.order.findUnique({
        where: { id },
        include: {
          fund: {
            select: { name: true, symbol: true, fundWalletPublicKey: true }
          },
          investor: {
            select: { email: true, publicKey: true }
          }
        }
      });

      if (!existingOrder) {
        return reply.status(404).send({ error: 'Order not found' });
      }

      if (existingOrder.status !== 'COMPLETED') {
        return reply.status(400).send({ 
          error: 'Order must be completed before approval',
          details: { currentStatus: existingOrder.status }
        });
      }

      if (existingOrder.approvalStatus !== 'PENDING_APPROVAL') {
        return reply.status(400).send({ 
          error: 'Order already processed',
          details: { currentApprovalStatus: existingOrder.approvalStatus }
        });
      }

      if (action === 'approve') {
        const order = await fastify.prisma.order.update({
          where: { id },
          data: { approvalStatus: 'APPROVED' },
          include: {
            fund: {
              select: { name: true, symbol: true }
            },
            investor: {
              select: { email: true, publicKey: true }
            }
          }
        });

        return { order, message: 'Order approved successfully' };
      } else {
        // Reject - requires refund transaction hash
        if (!refundTxHash) {
          // Return refund details for frontend to build the transaction
          return {
            requiresRefund: true,
            refundDetails: {
              destination: existingOrder.investor.publicKey,
              amount: existingOrder.total.toString(),
              memo: `Refund ${id.substring(0, 20)}`
            }
          };
        }

        const order = await fastify.prisma.order.update({
          where: { id },
          data: { 
            approvalStatus: 'REJECTED',
            refundTxHash
          },
          include: {
            fund: {
              select: { name: true, symbol: true }
            },
            investor: {
              select: { email: true, publicKey: true }
            }
          }
        });

        return { order, message: 'Order rejected and refunded successfully' };
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    throw new Error('Invalid token');
  }
}

export async function dashboardRoutes(fastify: FastifyInstance) {
  // Get pending counts for approval (Gestor only)
  fastify.get('/pending-counts', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const user = verifyToken(token);
      
      if (user.role !== 'GESTOR') {
        return reply.status(403).send({ error: 'Access denied' });
      }

      // Count pending consultores
      const pendingConsultores = await fastify.prisma.user.count({
        where: { 
          role: 'CONSULTOR',
          status: 'PENDING'
        }
      });

      // Count pending investidores
      const pendingInvestidores = await fastify.prisma.user.count({
        where: { 
          role: 'INVESTIDOR',
          status: 'PENDING'
        }
      });

      // Count pending funds
      const pendingFunds = await fastify.prisma.fund.count({
        where: { 
          status: 'PENDING'
        }
      });

      // Count pending cedentes (assignors)
      const pendingCedentes = await fastify.prisma.cedente.count({
        where: { 
          status: 'PENDING'
        }
      });

      // Count pending sacados (debtors)
      const pendingSacados = await fastify.prisma.sacado.count({
        where: { 
          status: 'PENDING'
        }
      });

      return {
        pendingCounts: {
          consultores: pendingConsultores,
          investidores: pendingInvestidores,
          funds: pendingFunds,
          assignors: pendingCedentes,
          debtors: pendingSacados
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}

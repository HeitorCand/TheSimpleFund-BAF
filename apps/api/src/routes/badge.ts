import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { 
  calculateBadge, 
  generateBadgeProof, 
  verifyBadgeProof, 
  getBadgeInfo, 
  getBadgeProgress,
  InvestorBadge 
} from '../services/zkBadge.js';

export async function badgeRoutes(fastify: FastifyInstance) {
  
  // Get user badge and progress
  fastify.get('/:userId', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const { userId } = request.params as { userId: string };

      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          totalInvested: true,
          investorBadge: true,
          badgeProofHash: true,
          lastBadgeUpdate: true,
        }
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const currentBadge = user.investorBadge as InvestorBadge;
      const badgeInfo = getBadgeInfo(currentBadge);
      const progress = getBadgeProgress(user.totalInvested);

      return {
        user: {
          id: user.id,
          email: user.email,
          totalInvested: user.totalInvested,
          lastBadgeUpdate: user.lastBadgeUpdate,
        },
        badge: {
          ...badgeInfo,
          hasProof: !!user.badgeProofHash,
        },
        progress,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Verify badge proof
  fastify.post('/:userId/verify', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const { userId } = request.params as { userId: string };

      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          investorBadge: true,
          badgeProofHash: true,
        }
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      if (!user.badgeProofHash) {
        return reply.status(400).send({ error: 'No badge proof available' });
      }

      const isValid = verifyBadgeProof(
        user.id,
        user.investorBadge as InvestorBadge,
        user.badgeProofHash
      );

      return {
        verified: isValid,
        badge: user.investorBadge,
        proofHash: user.badgeProofHash,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Force badge recalculation (admin only)
  fastify.post('/:userId/recalculate', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const { userId } = request.params as { userId: string };

      // Calcular total investido
      const orders = await fastify.prisma.order.findMany({
        where: {
          investorId: userId,
          status: 'COMPLETED'
        }
      });

      const totalInvested = orders.reduce((sum, order) => sum + order.total, 0);
      
      // Calcular novo badge
      const newBadge = calculateBadge(totalInvested);
      const badgeProof = generateBadgeProof(userId, newBadge, totalInvested);

      // Atualizar badge
      const user = await fastify.prisma.user.update({
        where: { id: userId },
        data: {
          totalInvested,
          investorBadge: newBadge,
          badgeProofHash: badgeProof,
          lastBadgeUpdate: new Date(),
        }
      });

      const badgeInfo = getBadgeInfo(newBadge);
      const progress = getBadgeProgress(totalInvested);

      return {
        message: 'Badge recalculado com sucesso',
        user: {
          id: user.id,
          totalInvested: user.totalInvested,
          badge: user.investorBadge,
          lastUpdate: user.lastBadgeUpdate,
        },
        badgeInfo,
        progress,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get all badge tiers info
  fastify.get('/info/tiers', async (request, reply) => {
    try {
      const badges = [
        InvestorBadge.BRONZE,
        InvestorBadge.SILVER,
        InvestorBadge.GOLD,
      ];

      const tiers = badges.map(badge => getBadgeInfo(badge));

      return { tiers };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get leaderboard (top investors by badge)
  fastify.get('/leaderboard', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const topInvestors = await fastify.prisma.user.findMany({
        where: {
          role: 'INVESTOR',
          investorBadge: { not: 'NONE' }
        },
        select: {
          id: true,
          email: true,
          investorBadge: true,
          totalInvested: true,
          lastBadgeUpdate: true,
        },
        orderBy: {
          totalInvested: 'desc'
        },
        take: 100
      });

      const leaderboard = topInvestors.map(investor => {
        const badgeInfo = getBadgeInfo(investor.investorBadge as InvestorBadge);
        return {
          userId: investor.id,
          email: investor.email.replace(/(.{3}).*(@.*)/, '$1***$2'), // Ocultar parte do email
          badge: {
            level: investor.investorBadge,
            name: badgeInfo.name,
            icon: badgeInfo.icon,
            color: badgeInfo.color,
          },
          // Não revelar valor exato, apenas range
          investmentRange: {
            min: badgeInfo.minAmount,
            max: badgeInfo.badge === InvestorBadge.GOLD ? null : undefined,
          },
          lastUpdate: investor.lastBadgeUpdate,
        };
      });

      return { leaderboard };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}

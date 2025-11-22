import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AVAILABLE_POOLS } from '../config/blend.js';
import { 
  buildDepositTransaction, 
  buildWithdrawTransaction,
  toSmallestUnit,
  fromSmallestUnit
} from '../config/blendUtils.js';

// Validation schemas
const createPoolSchema = z.object({
  name: z.string().min(1),
  fundId: z.string().cuid(),
  blendPoolAddress: z.string(),
  assetAddress: z.string(),
});

const depositSchema = z.object({
  poolId: z.string().cuid(),
  amount: z.number().positive(),
  txHash: z.string(), // Transaction hash after user signs
});

const withdrawSchema = z.object({
  poolId: z.string().cuid(),
  amount: z.number().positive(),
  txHash: z.string(), // Transaction hash after user signs
});

const buildDepositTxSchema = z.object({
  poolId: z.string().cuid(),
  amount: z.number().positive(),
  userAddress: z.string(),
});

const buildWithdrawTxSchema = z.object({
  poolId: z.string().cuid(),
  amount: z.number().positive(),
  userAddress: z.string(),
});

export async function poolRoutes(fastify: FastifyInstance) {
  
  // List available Blend pools (for pool creation)
  fastify.get('/pools/available', async (request, reply) => {
    try {
      return { pools: AVAILABLE_POOLS };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // List all pools
  fastify.get('/pools', async (request, reply) => {
    try {
      const pools = await fastify.prisma.pool.findMany({
        include: {
          fund: {
            select: {
              id: true,
              name: true,
              symbol: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { pools };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get pool by ID with details
  fastify.get('/pools/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const pool = await fastify.prisma.pool.findUnique({
        where: { id },
        include: {
          fund: {
            select: {
              id: true,
              name: true,
              symbol: true,
              consultor: {
                select: {
                  email: true,
                  publicKey: true,
                }
              }
            }
          }
        }
      });

      if (!pool) {
        return reply.status(404).send({ error: 'Pool not found' });
      }

      // Calculate current yield
      const currentYield = pool.currentBalance - pool.totalDeposited;

      return { 
        pool: {
          ...pool,
          currentYield,
          yieldPercentage: pool.totalDeposited > 0 
            ? (currentYield / pool.totalDeposited) * 100 
            : 0
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new pool
  fastify.post('/pools', async (request, reply) => {
    try {
      const body = createPoolSchema.parse(request.body);

      // Verify fund exists
      const fund = await fastify.prisma.fund.findUnique({
        where: { id: body.fundId }
      });

      if (!fund) {
        return reply.status(404).send({ error: 'Fund not found' });
      }

      // Create pool
      const pool = await fastify.prisma.pool.create({
        data: {
          name: body.name,
          fundId: body.fundId,
          blendPoolAddress: body.blendPoolAddress,
          assetAddress: body.assetAddress,
          totalDeposited: 0,
          currentBalance: 0,
          yieldEarned: 0,
          status: 'ACTIVE',
        },
        include: {
          fund: {
            select: {
              id: true,
              name: true,
              symbol: true,
            }
          }
        }
      });

      return { pool };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Build deposit transaction (returns XDR for user to sign)
  fastify.post('/pools/build-deposit', async (request, reply) => {
    try {
      const body = buildDepositTxSchema.parse(request.body);

      const pool = await fastify.prisma.pool.findUnique({
        where: { id: body.poolId }
      });

      if (!pool) {
        return reply.status(404).send({ error: 'Pool not found' });
      }

      if (pool.status !== 'ACTIVE') {
        return reply.status(400).send({ error: 'Pool is not active' });
      }

      // Convert amount to smallest unit (7 decimals for most Stellar assets)
      const amountInStroops = toSmallestUnit(body.amount, 7);

      // Build the deposit transaction
      const transactionXdr = await buildDepositTransaction(
        pool.blendPoolAddress,
        body.userAddress,
        pool.assetAddress,
        amountInStroops
      );

      return {
        transactionXdr,
        poolId: pool.id,
        amount: body.amount,
        message: 'Sign this transaction to deposit into the pool'
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to build deposit transaction' });
    }
  });

  // Confirm deposit (after transaction is signed and submitted)
  fastify.post('/pools/deposit', async (request, reply) => {
    try {
      const body = depositSchema.parse(request.body);

      const pool = await fastify.prisma.pool.findUnique({
        where: { id: body.poolId }
      });

      if (!pool) {
        return reply.status(404).send({ error: 'Pool not found' });
      }

      // Update pool with deposit
      const updatedPool = await fastify.prisma.pool.update({
        where: { id: body.poolId },
        data: {
          totalDeposited: pool.totalDeposited + body.amount,
          currentBalance: pool.currentBalance + body.amount,
          depositTxHash: body.txHash,
          lastYieldUpdate: new Date(),
        }
      });

      return { 
        pool: updatedPool,
        message: 'Deposit confirmed successfully'
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to confirm deposit' });
    }
  });

  // Build withdraw transaction (returns XDR for user to sign)
  fastify.post('/pools/build-withdraw', async (request, reply) => {
    try {
      const body = buildWithdrawTxSchema.parse(request.body);

      const pool = await fastify.prisma.pool.findUnique({
        where: { id: body.poolId }
      });

      if (!pool) {
        return reply.status(404).send({ error: 'Pool not found' });
      }

      if (body.amount > pool.currentBalance) {
        return reply.status(400).send({ error: 'Insufficient balance in pool' });
      }

      // Convert amount to smallest unit
      const amountInStroops = toSmallestUnit(body.amount, 7);

      // Build the withdraw transaction
      const transactionXdr = await buildWithdrawTransaction(
        pool.blendPoolAddress,
        body.userAddress,
        pool.assetAddress,
        amountInStroops
      );

      return {
        transactionXdr,
        poolId: pool.id,
        amount: body.amount,
        message: 'Sign this transaction to withdraw from the pool'
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to build withdraw transaction' });
    }
  });

  // Confirm withdraw (after transaction is signed and submitted)
  fastify.post('/pools/withdraw', async (request, reply) => {
    try {
      const body = withdrawSchema.parse(request.body);

      const pool = await fastify.prisma.pool.findUnique({
        where: { id: body.poolId }
      });

      if (!pool) {
        return reply.status(404).send({ error: 'Pool not found' });
      }

      // Calculate yield before withdrawal
      const yieldEarned = pool.currentBalance - pool.totalDeposited;

      // Update pool with withdrawal
      const updatedPool = await fastify.prisma.pool.update({
        where: { id: body.poolId },
        data: {
          currentBalance: pool.currentBalance - body.amount,
          yieldEarned: pool.yieldEarned + yieldEarned,
          withdrawTxHash: body.txHash,
          lastYieldUpdate: new Date(),
        }
      });

      return { 
        pool: updatedPool,
        withdrawnAmount: body.amount,
        message: 'Withdrawal confirmed successfully'
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to confirm withdrawal' });
    }
  });

  // Update pool yield (can be called periodically or manually)
  fastify.post('/pools/:id/update-yield', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { currentBalance, apy } = request.body as { currentBalance: number; apy?: number };

      const pool = await fastify.prisma.pool.findUnique({
        where: { id }
      });

      if (!pool) {
        return reply.status(404).send({ error: 'Pool not found' });
      }

      const updatedPool = await fastify.prisma.pool.update({
        where: { id },
        data: {
          currentBalance,
          apy: apy || pool.apy,
          lastYieldUpdate: new Date(),
        }
      });

      const yieldEarned = updatedPool.currentBalance - updatedPool.totalDeposited;

      return {
        pool: updatedPool,
        yieldEarned,
        message: 'Yield updated successfully'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update yield' });
    }
  });

  // Get pools by fund
  fastify.get('/funds/:fundId/pools', async (request, reply) => {
    try {
      const { fundId } = request.params as { fundId: string };

      const pools = await fastify.prisma.pool.findMany({
        where: { fundId },
        include: {
          fund: {
            select: {
              id: true,
              name: true,
              symbol: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate metrics
      const poolsWithMetrics = pools.map(pool => {
        const currentYield = pool.currentBalance - pool.totalDeposited;
        return {
          ...pool,
          currentYield,
          yieldPercentage: pool.totalDeposited > 0 
            ? (currentYield / pool.totalDeposited) * 100 
            : 0
        };
      });

      return { pools: poolsWithMetrics };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}

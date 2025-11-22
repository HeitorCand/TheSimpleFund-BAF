// src/config/prisma.ts
import { PrismaClient } from '@prisma/client';

// Singleton instance
let prisma: PrismaClient;

export function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['warn', 'error']  // Menos logging em dev para melhor performance
        : ['error'],
      
      // Otimizações de connection pool
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Configurar connection pool settings
    prisma.$connect();
  }
  
  return prisma;
}

// Graceful shutdown
export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
  }
}

export default getPrismaClient();

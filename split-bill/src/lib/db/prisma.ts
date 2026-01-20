import { PrismaClient } from '@prisma/client';

/**
 * Globalna Prisma Client instanca
 * Koristi se singleton pattern da se izbegne kreiranje više konekcija u development-u
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
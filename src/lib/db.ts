import { PrismaClient } from '../../generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = createClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
export * from '../../generated/prisma/client'; // Export types as well for convenience

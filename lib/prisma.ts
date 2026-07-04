import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let connectionString = process.env.DATABASE_URL || '';

// Parse prisma+postgres:// connection strings (Prisma 7 development serverless db)
if (connectionString.startsWith('prisma+postgres://')) {
  try {
    const urlObj = new URL(connectionString);
    const apiKey = urlObj.searchParams.get('api_key');
    if (apiKey) {
      const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed.databaseUrl) {
        connectionString = parsed.databaseUrl;
      }
    }
  } catch (err) {
    console.error('Failed to parse prisma+postgres URL:', err);
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

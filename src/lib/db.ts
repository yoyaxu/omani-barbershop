import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl() {
  // On Vercel, use /tmp for SQLite persistence within function instances
  if (process.env.VERCEL === '1') {
    return 'file:/tmp/omani-barbershop.db'
  }
  return process.env.DATABASE_URL || 'file:./db/omani-barbershop.db'
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Initialize database on Vercel (create tables if they don't exist)
if (process.env.VERCEL === '1') {
  db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Appointment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(() => {
    // Table already exists, ignore error
  })
}

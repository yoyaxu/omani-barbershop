import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In Vercel serverless, use /tmp for the database
const isVercel = !!process.env.VERCEL
const DB_DIR = isVercel ? '/tmp/omani-db' : path.join(process.cwd(), 'db')
const DB_PATH = path.join(DB_DIR, 'omani.db')
const DB_URL = `file:${DB_PATH}`

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

// Set DATABASE_URL for PrismaClient
process.env.DATABASE_URL = DB_URL

export const db =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Track if we've done the initial setup
let initialized = false

export async function ensureDbInitialized() {
  if (initialized) return

  try {
    // Try a simple query to see if tables exist
    await db.service.count()
    initialized = true
  } catch (error: any) {
    // If tables don't exist, we need to create them
    if (error?.message?.includes('no such table') || error?.code === 'P2021') {
      console.log('Tables not found, creating database schema...')
      await createTablesAndSeed()
      initialized = true
    } else {
      console.error('DB init error:', error)
    }
  }

  // Auto-seed if no services exist
  try {
    const count = await db.service.count()
    if (count === 0) {
      await seedServices()
    }
    initialized = true
  } catch {
    // Already handled above
  }
}

async function createTablesAndSeed() {
  // Use Prisma's internal $executeRaw to create tables
  // This works because SQLite will auto-create the database file

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Service (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      image TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      "order" INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Appointment (
      id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      numberOfPeople INTEGER NOT NULL DEFAULT 1,
      totalPrice INTEGER NOT NULL,
      totalDuration INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS AppointmentService (
      id TEXT PRIMARY KEY,
      appointmentId TEXT NOT NULL,
      serviceId TEXT NOT NULL,
      price INTEGER NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointmentId) REFERENCES Appointment(id) ON DELETE CASCADE,
      FOREIGN KEY (serviceId) REFERENCES Service(id),
      UNIQUE(appointmentId, serviceId)
    );
  `)

  console.log('Tables created successfully')
  await seedServices()
}

async function seedServices() {
  const services = [
    { id: 'corte-de-cabello', name: 'Corte de Cabello', description: 'Corte de cabello profesional con estilo personalizado', price: 400, duration: 30, category: 'corte', order: 1 },
    { id: 'corte-plus-barba', name: 'Corte + Barba', description: 'Combo de corte de cabello y arreglo de barba completo', price: 600, duration: 45, category: 'combo', order: 2 },
    { id: 'afeitado-de-barba', name: 'Afeitado de Barba', description: 'Afeitado profesional de barba con navaja y toalla caliente', price: 250, duration: 20, category: 'barba', order: 3 },
    { id: 'diseno-de-cejas', name: 'Diseño de Cejas', description: 'Diseño y depilación de cejas con precisión', price: 150, duration: 15, category: 'detalle', order: 4 },
    { id: 'tratamiento-capilar', name: 'Tratamiento Capilar', description: 'Tratamiento profundo para el cuidado del cabello', price: 500, duration: 40, category: 'tratamiento', order: 5 },
    { id: 'corte-nino', name: 'Corte Niño', description: 'Corte de cabello para niños hasta 12 años', price: 300, duration: 25, category: 'corte', order: 6 },
    { id: 'tinte-de-cabello', name: 'Tinte de Cabello', description: 'Aplicación de tinte profesional con el color de tu preferencia', price: 800, duration: 60, category: 'tratamiento', order: 7 },
    { id: 'facial-basico', name: 'Facial Básico', description: 'Limpieza facial profunda con productos premium', price: 400, duration: 30, category: 'facial', order: 8 },
    { id: 'corte-plus-barba-plus-facial', name: 'Corte + Barba + Facial', description: 'Experiencia completa: corte, barba y facial en una sola visita', price: 900, duration: 75, category: 'combo', order: 9 },
    { id: 'lavado-plus-styling', name: 'Lavado + Styling', description: 'Lavado profesional con secado y styling personalizado', price: 350, duration: 25, category: 'styling', order: 10 },
  ]

  try {
    await db.service.createMany({ data: services })
    console.log('Services seeded successfully')
  } catch (e) {
    console.error('Seed error:', e)
  }
}

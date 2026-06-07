import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

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

// In Vercel: if DB doesn't exist at /tmp, create it by pushing the schema
if (isVercel && !fs.existsSync(DB_PATH)) {
  try {
    console.log('Setting up database for Vercel serverless...')
    // Use Prisma CLI to push schema to the new database location
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
      env: { ...process.env, DATABASE_URL: DB_URL },
      stdio: 'pipe',
      timeout: 30000,
    })
    console.log('Database created at:', DB_PATH)
  } catch (e) {
    console.error('Failed to create database:', e)
  }
}

// Set DATABASE_URL for PrismaClient
process.env.DATABASE_URL = DB_URL

export const db =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Auto-seed services on first request
let dbSeeded = false

export async function ensureDbInitialized() {
  if (dbSeeded) return

  try {
    const count = await db.service.count()
    if (count === 0) {
      await seedServices()
    }
    dbSeeded = true
  } catch (error) {
    console.error('DB init error:', error)
    dbSeeded = false
  }
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

  await db.service.createMany({ data: services })
  console.log('Services seeded successfully')
}

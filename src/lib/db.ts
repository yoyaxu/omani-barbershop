import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Password hashing utilities (simple but sufficient for a single-admin app)
const encoder = new TextEncoder()

export async function hashPassword(password: string): Promise<string> {
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Initialize admin settings with default password if not exists
export async function ensureAdminInitialized() {
  const admin = await db.adminSettings.findUnique({ where: { id: 'admin' } })
  if (!admin) {
    const defaultHash = await hashPassword('aflow2024')
    await db.adminSettings.create({
      data: {
        id: 'admin',
        password: defaultHash,
        email: 'abreuomani@gmail.com',
        phone: '18296576185',
      },
    })
    console.log('Admin account initialized with default password')
  }
}

// Seed services if none exist
export async function ensureServicesSeeded() {
  const count = await db.service.count()
  if (count === 0) {
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
}

// Combined initialization
export async function ensureDbInitialized() {
  await ensureAdminInitialized()
  await ensureServicesSeeded()
}

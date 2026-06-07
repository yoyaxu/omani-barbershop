import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const services = [
  {
    name: 'Corte de Cabello',
    description: 'Corte de cabello profesional con estilo personalizado',
    price: 400,
    duration: 30,
    category: 'corte',
    order: 1,
  },
  {
    name: 'Corte + Barba',
    description: 'Combo de corte de cabello y arreglo de barba completo',
    price: 600,
    duration: 45,
    category: 'combo',
    order: 2,
  },
  {
    name: 'Afeitado de Barba',
    description: 'Afeitado profesional de barba con navaja y toalla caliente',
    price: 250,
    duration: 20,
    category: 'barba',
    order: 3,
  },
  {
    name: 'Diseño de Cejas',
    description: 'Diseño y depilación de cejas con precisión',
    price: 150,
    duration: 15,
    category: 'detalle',
    order: 4,
  },
  {
    name: 'Tratamiento Capilar',
    description: 'Tratamiento profundo para el cuidado del cabello',
    price: 500,
    duration: 40,
    category: 'tratamiento',
    order: 5,
  },
  {
    name: 'Corte Niño',
    description: 'Corte de cabello para niños hasta 12 años',
    price: 300,
    duration: 25,
    category: 'corte',
    order: 6,
  },
  {
    name: 'Tinte de Cabello',
    description: 'Aplicación de tinte profesional con el color de tu preferencia',
    price: 800,
    duration: 60,
    category: 'tratamiento',
    order: 7,
  },
  {
    name: 'Facial Básico',
    description: 'Limpieza facial profunda con productos premium',
    price: 400,
    duration: 30,
    category: 'facial',
    order: 8,
  },
  {
    name: 'Corte + Barba + Facial',
    description: 'Experiencia completa: corte, barba y facial en una sola visita',
    price: 900,
    duration: 75,
    category: 'combo',
    order: 9,
  },
  {
    name: 'Lavado + Styling',
    description: 'Lavado profesional con secado y styling personalizado',
    price: 350,
    duration: 25,
    category: 'styling',
    order: 10,
  },
]

async function main() {
  console.log('Seeding services...')

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name.toLowerCase().replace(/\s+/g, '-').replace(/\+/g, 'plus') },
      update: service,
      create: {
        id: service.name.toLowerCase().replace(/\s+/g, '-').replace(/\+/g, 'plus'),
        ...service,
      },
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

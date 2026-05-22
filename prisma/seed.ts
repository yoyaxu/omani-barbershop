import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create super admin
  const superAdminPassword = await hash('admin123', 12)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@barberdo.com' },
    update: {},
    create: {
      email: 'admin@barberdo.com',
      passwordHash: superAdminPassword,
      name: 'BarberDo Admin',
      role: 'super_admin',
    },
  })
  console.log('✅ Super admin created:', superAdmin.email)

  // Create Omani Barbershop owner
  const omaniPassword = await hash('omani2024', 12)
  const omaniOwner = await prisma.user.upsert({
    where: { email: 'omani@barberdo.com' },
    update: {},
    create: {
      email: 'omani@barberdo.com',
      passwordHash: omaniPassword,
      name: 'Omani Admin',
      role: 'shop_admin',
    },
  })
  console.log('✅ Omani owner created:', omaniOwner.email)

  // Create Omani Barbershop
  const omaniShop = await prisma.shop.upsert({
    where: { slug: 'omani' },
    update: {},
    create: {
      name: 'Omani Barbershop',
      slug: 'omani',
      description: 'Tu barbería de confianza. Estilo, precisión y profesionalismo en cada corte.',
      whatsappNumber: '8293196108',
      instagram: '@omani_barbershop',
      facebook: 'https://www.facebook.com/profile.php?id=100054503348727',
      address: 'Santo Domingo Este, República Dominicana',
      googleMapsUrl: 'https://www.google.com/maps/place/Omani+Barbershop/@18.5203355,-69.9135742,17z',
      latitude: 18.5203355,
      longitude: -69.9135742,
      openingTime: '9:00 AM',
      closingTime: '7:00 PM',
      themeColor: '#D4A853',
      ownerId: omaniOwner.id,
    },
  })
  console.log('✅ Omani Barbershop created:', omaniShop.slug)

  // Update owner with shopId
  await prisma.user.update({
    where: { id: omaniOwner.id },
    data: { shopId: omaniShop.id },
  })

  // Create Omani services
  const services = [
    { name: 'Corte de Cabello', price: 250, duration: 30, description: 'Corte personalizado con el estilo que te identifica. Desde clásicos hasta los más modernos fades y diseños.', order: 1 },
    { name: 'Afeitada & Barba', price: 200, duration: 25, description: 'Perfilado y afeitada profesional con navaja y toalla caliente. Tu barba en las mejores manos.', order: 2 },
    { name: 'Styling & Diseño', price: 300, duration: 40, description: 'Diseños artísticos, lineups y estilismo con productos premium. Destaca con un look único.', order: 3 },
    { name: 'Combo Corte + Barba', price: 400, duration: 50, description: 'El paquete completo: corte de cabello más afeitada y perfilado de barba. La experiencia completa.', order: 4 },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: `${omaniShop.id}-${service.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        shopId: omaniShop.id,
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.description,
        order: service.order,
      },
    })
  }
  console.log('✅ Omani services created')

  console.log('\n🎉 Seed complete!')
  console.log('\n📋 Login credentials:')
  console.log('  Super Admin: admin@barberdo.com / admin123')
  console.log('  Omani Admin: omani@barberdo.com / omani2024')
  console.log('  Omani URL: /shop/omani')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

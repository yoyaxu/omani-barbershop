import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const existingServices = await db.service.count()

    if (existingServices > 0) {
      return NextResponse.json({ message: 'Los servicios ya existen', count: existingServices })
    }

    const services = [
      {
        id: 'corte-de-cabello',
        name: 'Corte de Cabello',
        description: 'Corte de cabello profesional con estilo personalizado',
        price: 400,
        duration: 30,
        category: 'corte',
        order: 1,
      },
      {
        id: 'corte-plus-barba',
        name: 'Corte + Barba',
        description: 'Combo de corte de cabello y arreglo de barba completo',
        price: 600,
        duration: 45,
        category: 'combo',
        order: 2,
      },
      {
        id: 'afeitado-de-barba',
        name: 'Afeitado de Barba',
        description: 'Afeitado profesional de barba con navaja y toalla caliente',
        price: 250,
        duration: 20,
        category: 'barba',
        order: 3,
      },
      {
        id: 'diseno-de-cejas',
        name: 'Diseño de Cejas',
        description: 'Diseño y depilación de cejas con precisión',
        price: 150,
        duration: 15,
        category: 'detalle',
        order: 4,
      },
      {
        id: 'tratamiento-capilar',
        name: 'Tratamiento Capilar',
        description: 'Tratamiento profundo para el cuidado del cabello',
        price: 500,
        duration: 40,
        category: 'tratamiento',
        order: 5,
      },
      {
        id: 'corte-nino',
        name: 'Corte Niño',
        description: 'Corte de cabello para niños hasta 12 años',
        price: 300,
        duration: 25,
        category: 'corte',
        order: 6,
      },
      {
        id: 'tinte-de-cabello',
        name: 'Tinte de Cabello',
        description: 'Aplicación de tinte profesional con el color de tu preferencia',
        price: 800,
        duration: 60,
        category: 'tratamiento',
        order: 7,
      },
      {
        id: 'facial-basico',
        name: 'Facial Básico',
        description: 'Limpieza facial profunda con productos premium',
        price: 400,
        duration: 30,
        category: 'facial',
        order: 8,
      },
      {
        id: 'corte-plus-barba-plus-facial',
        name: 'Corte + Barba + Facial',
        description: 'Experiencia completa: corte, barba y facial en una sola visita',
        price: 900,
        duration: 75,
        category: 'combo',
        order: 9,
      },
      {
        id: 'lavado-plus-styling',
        name: 'Lavado + Styling',
        description: 'Lavado profesional con secado y styling personalizado',
        price: 350,
        duration: 25,
        category: 'styling',
        order: 10,
      },
    ]

    await db.service.createMany({ data: services })

    return NextResponse.json({ message: 'Servicios creados exitosamente', count: services.length })
  } catch (error) {
    console.error('Error seeding services:', error)
    return NextResponse.json(
      { error: 'Error al crear servicios' },
      { status: 500 }
    )
  }
}

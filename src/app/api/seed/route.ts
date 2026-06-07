import { db, ensureDbInitialized } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    await ensureDbInitialized()
    const existingServices = await db.service.count()

    if (existingServices > 0) {
      return NextResponse.json({ message: 'Los servicios ya existen', count: existingServices })
    }

    // The seed is handled by ensureDbInitialized
    return NextResponse.json({ message: 'Servicios creados exitosamente' })
  } catch (error) {
    console.error('Error seeding services:', error)
    return NextResponse.json(
      { error: 'Error al crear servicios' },
      { status: 500 }
    )
  }
}

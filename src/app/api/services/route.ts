import { db, ensureDbInitialized } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await ensureDbInitialized()
    const services = await db.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(services)
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener servicios' },
      { status: 500 }
    )
  }
}

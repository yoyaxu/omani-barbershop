import { db, ensureDbInitialized } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    const where: Record<string, string> = {}
    if (date) where.date = date
    if (status) where.status = status

    const appointments = await db.appointment.findMany({
      where,
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Error al obtener citas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized()
    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerEmail,
      date,
      time,
      numberOfPeople,
      serviceIds,
      notes,
    } = body

    // Validate required fields
    if (!customerName || !customerPhone || !date || !time || !serviceIds?.length) {
      return NextResponse.json(
        { error: 'Nombre, teléfono, fecha, hora y servicios son requeridos' },
        { status: 400 }
      )
    }

    // Check for double-booking
    const existingAppointment = await db.appointment.findFirst({
      where: {
        date,
        time,
        status: { in: ['pending', 'confirmed'] },
      },
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Ya existe una cita en este horario. Por favor seleccione otro.' },
        { status: 409 }
      )
    }

    // Get service details
    const services = await db.service.findMany({
      where: { id: { in: serviceIds } },
    })

    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        { error: 'Uno o más servicios no existen' },
        { status: 400 }
      )
    }

    const totalPrice = services.reduce((sum, s) => sum + s.price, 0)
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0)

    const appointment = await db.appointment.create({
      data: {
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        date,
        time,
        numberOfPeople: numberOfPeople || 1,
        totalPrice,
        totalDuration,
        notes: notes || null,
        status: 'pending',
        services: {
          create: services.map((s) => ({
            serviceId: s.id,
            price: s.price,
          })),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Error al crear la cita' },
      { status: 500 }
    )
  }
}

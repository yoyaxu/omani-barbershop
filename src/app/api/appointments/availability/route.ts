import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getShopIdFromRequest } from '@/lib/auth'

// GET - Get available time slots for a specific date (public, shop-scoped)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })
    }

    const shopId = searchParams.get('shopId') || await getShopIdFromRequest(request)
    if (!shopId) {
      return NextResponse.json({ error: 'Barbería no especificada' }, { status: 400 })
    }

    // Find all booked appointments for this date and shop that are not cancelled
    const bookedAppointments = await db.appointment.findMany({
      where: {
        shopId,
        date,
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      select: {
        time: true,
      },
    })

    const bookedSlots = bookedAppointments.map((a) => a.time)

    return NextResponse.json({ bookedSlots })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Error al verificar disponibilidad' }, { status: 500 })
  }
}

import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Fecha requerida' },
        { status: 400 }
      )
    }

    // Generate all possible time slots (9:00 AM to 7:00 PM, every 30 min)
    const allSlots = []
    for (let hour = 9; hour < 19; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`)
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    // Get booked slots for the date
    const bookedAppointments = await db.appointment.findMany({
      where: {
        date,
        status: { in: ['pending', 'confirmed'] },
      },
      select: { time: true },
    })

    const bookedTimes = new Set(bookedAppointments.map((a) => a.time))

    // Check if the date is in the past
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const isToday = date === todayStr

    const availableSlots = allSlots.map((time) => {
      const isBooked = bookedTimes.has(time)
      let isPast = false

      if (isToday) {
        const [hours, minutes] = time.split(':').map(Number)
        const slotDate = new Date(today)
        slotDate.setHours(hours, minutes, 0, 0)
        isPast = slotDate <= today
      }

      return {
        time,
        available: !isBooked && !isPast,
      }
    })

    return NextResponse.json(availableSlots)
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener horarios disponibles' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get available time slots for a specific date
// Public endpoint - no auth required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Fecha requerida' },
        { status: 400 }
      );
    }

    // Find all booked appointments for this date that are not cancelled
    const bookedAppointments = await db.appointment.findMany({
      where: {
        date,
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      select: {
        time: true,
      },
    });

    const bookedTimes = bookedAppointments.map((a) => a.time);

    return NextResponse.json({ bookedTimes });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Error al verificar disponibilidad' },
      { status: 500 }
    );
  }
}

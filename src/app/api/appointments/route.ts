import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, service, date, time, notes } = body;

    if (!name || !phone || !service || !date || !time) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios son requeridos' },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.create({
      data: {
        name,
        phone,
        service,
        date,
        time,
        notes: notes || null,
        status: 'pending',
      },
    });

    return NextResponse.json(
      { message: 'Cita reservada exitosamente', appointment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Error al reservar la cita' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const appointments = await db.appointment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Error al obtener las citas' },
      { status: 500 }
    );
  }
}

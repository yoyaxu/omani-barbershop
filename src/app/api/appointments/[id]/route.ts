import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: { status },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    })

    return NextResponse.json(appointment)
  } catch {
    return NextResponse.json(
      { error: 'Error al actualizar la cita' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.appointmentService.deleteMany({
      where: { appointmentId: id },
    })

    await db.appointment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Cita eliminada' })
  } catch {
    return NextResponse.json(
      { error: 'Error al eliminar la cita' },
      { status: 500 }
    )
  }
}

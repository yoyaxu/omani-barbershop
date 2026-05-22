import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, getShopIdFromRequest } from '@/lib/auth'

// POST - Create appointment (public, no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, serviceId, date, time, notes, shopId: bodyShopId } = body

    if (!name || !phone || !serviceId || !date || !time) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios son requeridos' },
        { status: 400 }
      )
    }

    // Get shopId from request body (public booking) or from request headers
    let shopId = bodyShopId || await getShopIdFromRequest(request)
    if (!shopId) {
      return NextResponse.json({ error: 'Barbería no especificada' }, { status: 400 })
    }

    // Verify the service belongs to this shop
    const service = await db.service.findFirst({
      where: { id: serviceId, shopId },
    })
    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 400 })
    }

    const appointment = await db.appointment.create({
      data: {
        shopId,
        name,
        phone,
        serviceId,
        date,
        time,
        notes: notes || null,
        status: 'pending',
      },
      include: {
        service: true,
      },
    })

    // Get shop info for WhatsApp notification
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: { name: true, whatsappNumber: true },
    })

    // Generate WhatsApp notification URL for the shop owner
    const whatsappMessage = encodeURIComponent(
      `NUEVA CITA RESERVADA\n\n` +
      `Cliente: ${name}\n` +
      `Teléfono: ${phone}\n` +
      `Servicio: ${service.name}\n` +
      `Fecha: ${date}\n` +
      `Hora: ${time}` +
      (notes ? `\nNotas: ${notes}` : '') +
      `\n\nReserva desde la web de ${shop?.name || 'Barbería'}`
    )

    const ownerWhatsAppUrl = shop?.whatsappNumber
      ? `https://wa.me/${shop.whatsappNumber}?text=${whatsappMessage}`
      : null

    return NextResponse.json(
      {
        message: 'Cita reservada exitosamente',
        appointment,
        whatsappNotificationUrl: ownerWhatsAppUrl,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Error al reservar la cita' }, { status: 500 })
  }
}

// GET - List appointments (admin only, scoped to shop)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let shopId: string | null = null

    if (auth.role === 'super_admin') {
      // Super admin can see all or filter by shopId query param
      const { searchParams } = new URL(request.url)
      shopId = searchParams.get('shopId') || null
    } else {
      // Shop admin can only see their own shop
      shopId = auth.shopId || null
    }

    const where = shopId ? { shopId } : {}
    const appointments = await db.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: { name: true, price: true },
        },
      },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Error al obtener las citas' }, { status: 500 })
  }
}

// PATCH - Update appointment (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, phone, serviceId, date, time, notes, status } = body

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    // Find the appointment and verify access
    const existing = await db.appointment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // Shop admin can only update their own shop's appointments
    if (auth.role !== 'super_admin' && auth.shopId !== existing.shopId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (serviceId !== undefined) updateData.serviceId = serviceId
    if (date !== undefined) updateData.date = date
    if (time !== undefined) updateData.time = time
    if (notes !== undefined) updateData.notes = notes
    if (status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
      }
      updateData.status = status
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: updateData,
      include: {
        service: {
          select: { name: true, price: true },
        },
      },
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Error al actualizar la cita' }, { status: 500 })
  }
}

// DELETE - Delete an appointment (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    // Find the appointment and verify access
    const existing = await db.appointment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    if (auth.role !== 'super_admin' && auth.shopId !== existing.shopId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await db.appointment.delete({ where: { id } })

    return NextResponse.json({ message: 'Cita eliminada' })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'Error al eliminar la cita' }, { status: 500 })
  }
}

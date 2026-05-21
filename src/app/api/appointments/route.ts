import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

const SERVICE_NAMES: Record<string, string> = {
  corte: 'Corte de Cabello',
  barba: 'Afeitada & Barba',
  styling: 'Styling & Diseño',
  combo: 'Combo Corte + Barba',
};

// POST - Create appointment (public, no auth required)
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

    // Generate WhatsApp notification URL for the barbershop owner
    const serviceName = SERVICE_NAMES[service] || service;
    const whatsappMessage = encodeURIComponent(
      `💈 *NUEVA CITA RESERVADA*\n\n` +
      `👤 Cliente: ${name}\n` +
      `📱 Teléfono: ${phone}\n` +
      `✂️ Servicio: ${serviceName}\n` +
      `📅 Fecha: ${date}\n` +
      `🕐 Hora: ${time}` +
      (notes ? `\n📝 Notas: ${notes}` : '') +
      `\n\n_Reserva desde la web de Omani Barbershop_`
    );

    const ownerWhatsAppNumber = process.env.WHATSAPP_OWNER_NUMBER || '18095551234';
    const ownerWhatsAppUrl = `https://wa.me/${ownerWhatsAppNumber}?text=${whatsappMessage}`;

    return NextResponse.json(
      {
        message: 'Cita reservada exitosamente',
        appointment,
        whatsappNotificationUrl: ownerWhatsAppUrl,
      },
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

// GET - List appointments (admin only)
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

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

// PATCH - Update appointment (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, phone, service, date, time, notes, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Build update data dynamically
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (service !== undefined) updateData.service = service;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Estado no válido' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la cita' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an appointment (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    await db.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cita eliminada' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la cita' },
      { status: 500 }
    );
  }
}

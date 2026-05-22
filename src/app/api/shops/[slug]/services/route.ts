import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth'

// GET /api/shops/[slug]/services - List services for a shop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shop = await db.shop.findUnique({ where: { slug } })
    if (!shop) {
      return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })
    }

    const services = await db.service.findMany({
      where: { shopId: shop.id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Error al obtener servicios' }, { status: 500 })
  }
}

// POST /api/shops/[slug]/services - Create a new service (shop admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const auth = await verifyAdmin(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shop = await db.shop.findUnique({ where: { slug } })
    if (!shop) {
      return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })
    }

    // Verify the user has access to this shop
    if (auth.role !== 'super_admin' && auth.shopId !== shop.id) {
      return NextResponse.json({ error: 'No autorizado para esta barbería' }, { status: 403 })
    }

    const body = await request.json()
    const { name, price, duration, description, imageUrl, order, isActive } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 })
    }

    const service = await db.service.create({
      data: {
        shopId: shop.id,
        name,
        price: Number(price),
        duration: duration ? Number(duration) : 30,
        description: description || null,
        imageUrl: imageUrl || null,
        order: order || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Error al crear el servicio' }, { status: 500 })
  }
}

// PATCH /api/shops/[slug]/services - Update a service (shop admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const auth = await verifyAdmin(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shop = await db.shop.findUnique({ where: { slug } })
    if (!shop) {
      return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })
    }

    if (auth.role !== 'super_admin' && auth.shopId !== shop.id) {
      return NextResponse.json({ error: 'No autorizado para esta barbería' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, price, duration, description, imageUrl, order, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'ID del servicio es requerido' }, { status: 400 })
    }

    // Verify service belongs to this shop
    const existingService = await db.service.findFirst({
      where: { id, shopId: shop.id },
    })
    if (!existingService) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (price !== undefined) updateData.price = Number(price)
    if (duration !== undefined) updateData.duration = Number(duration)
    if (description !== undefined) updateData.description = description
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (order !== undefined) updateData.order = Number(order)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    const service = await db.service.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Error al actualizar el servicio' }, { status: 500 })
  }
}

// DELETE /api/shops/[slug]/services - Delete a service (shop admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const auth = await verifyAdmin(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shop = await db.shop.findUnique({ where: { slug } })
    if (!shop) {
      return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })
    }

    if (auth.role !== 'super_admin' && auth.shopId !== shop.id) {
      return NextResponse.json({ error: 'No autorizado para esta barbería' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID del servicio es requerido' }, { status: 400 })
    }

    // Verify service belongs to this shop
    const existingService = await db.service.findFirst({
      where: { id, shopId: shop.id },
    })
    if (!existingService) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    await db.service.delete({ where: { id } })

    return NextResponse.json({ message: 'Servicio eliminado' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Error al eliminar el servicio' }, { status: 500 })
  }
}

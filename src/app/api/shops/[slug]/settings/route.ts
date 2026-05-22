import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth'

// GET /api/shops/[slug]/settings - Get shop settings (shop admin only)
export async function GET(
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

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error fetching shop settings:', error)
    return NextResponse.json({ error: 'Error al obtener la configuración' }, { status: 500 })
  }
}

// PATCH /api/shops/[slug]/settings - Update shop settings (shop admin only)
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
    const allowedFields = [
      'name', 'description', 'whatsappNumber', 'instagram', 'facebook',
      'address', 'googleMapsUrl', 'latitude', 'longitude',
      'openingTime', 'closingTime', 'themeColor', 'logoUrl', 'heroImageUrl', 'isActive',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedShop = await db.shop.update({
      where: { slug },
      data: updateData,
    })

    return NextResponse.json({ shop: updatedShop })
  } catch (error) {
    console.error('Error updating shop settings:', error)
    return NextResponse.json({ error: 'Error al actualizar la configuración' }, { status: 500 })
  }
}

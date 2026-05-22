import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth'

// GET /api/shops/[slug]/gallery - List gallery images for a shop
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

    const galleryImages = await db.galleryImage.findMany({
      where: { shopId: shop.id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ galleryImages })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json({ error: 'Error al obtener la galería' }, { status: 500 })
  }
}

// POST /api/shops/[slug]/gallery - Add a gallery image (shop admin only)
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

    if (auth.role !== 'super_admin' && auth.shopId !== shop.id) {
      return NextResponse.json({ error: 'No autorizado para esta barbería' }, { status: 403 })
    }

    const body = await request.json()
    const { url, caption, order } = body

    if (!url) {
      return NextResponse.json({ error: 'URL de imagen es requerida' }, { status: 400 })
    }

    const image = await db.galleryImage.create({
      data: {
        shopId: shop.id,
        url,
        caption: caption || null,
        order: order || 0,
      },
    })

    return NextResponse.json({ image }, { status: 201 })
  } catch (error) {
    console.error('Error creating gallery image:', error)
    return NextResponse.json({ error: 'Error al agregar imagen' }, { status: 500 })
  }
}

// DELETE /api/shops/[slug]/gallery - Delete a gallery image (shop admin only)
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
      return NextResponse.json({ error: 'ID de imagen es requerido' }, { status: 400 })
    }

    const existing = await db.galleryImage.findFirst({
      where: { id, shopId: shop.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
    }

    await db.galleryImage.delete({ where: { id } })

    return NextResponse.json({ message: 'Imagen eliminada' })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 })
  }
}

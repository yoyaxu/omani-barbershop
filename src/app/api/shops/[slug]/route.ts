import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shops/[slug] - Get shop by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        galleryImages: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })
    }

    // Separate data for cleaner response
    const { services, galleryImages, ...shopData } = shop

    return NextResponse.json({
      shop: shopData,
      services,
      gallery: galleryImages,
    })
  } catch (error) {
    console.error('Error fetching shop:', error)
    return NextResponse.json({ error: 'Error al obtener la barbería' }, { status: 500 })
  }
}

import { db, ensureDbInitialized } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/settings - Get site settings
export async function GET() {
  try {
    await ensureDbInitialized()
    let settings = await db.siteSettings.findUnique({ where: { id: 'site' } })
    if (!settings) {
      // Create default settings with current gallery images
      const defaultImages = JSON.stringify([
        '/instagram/insta1.png',
        '/instagram/insta2.png',
        '/instagram/insta3.png',
        '/instagram/insta4.png',
        '/instagram/insta5.png',
        '/instagram/insta6.png',
      ])
      settings = await db.siteSettings.create({
        data: {
          id: 'site',
          galleryMode: 'manual',
          galleryImages: defaultImages,
        },
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// PATCH /api/settings - Update site settings
export async function PATCH(request: NextRequest) {
  try {
    await ensureDbInitialized()
    const body = await request.json()
    const { instagramWidget, galleryMode, galleryImages } = body

    const updateData: Record<string, unknown> = {}
    if (instagramWidget !== undefined) updateData.instagramWidget = instagramWidget
    if (galleryMode !== undefined) updateData.galleryMode = galleryMode
    if (galleryImages !== undefined) updateData.galleryImages = typeof galleryImages === 'string' ? galleryImages : JSON.stringify(galleryImages)

    const settings = await db.siteSettings.upsert({
      where: { id: 'site' },
      update: updateData,
      create: {
        id: 'site',
        instagramWidget: instagramWidget || null,
        galleryMode: galleryMode || 'manual',
        galleryImages: typeof galleryImages === 'string' ? galleryImages : JSON.stringify(galleryImages || []),
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}

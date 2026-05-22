import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth'

// GET /api/shops - List all shops (super admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if (!auth.authenticated || auth.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shops = await db.shop.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { services: true, appointments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ shops })
  } catch (error) {
    console.error('Error fetching shops:', error)
    return NextResponse.json({ error: 'Error al obtener barberías' }, { status: 500 })
  }
}

// POST /api/shops - Create a new shop (super admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if (!auth.authenticated || auth.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      whatsappNumber,
      instagram,
      facebook,
      address,
      googleMapsUrl,
      latitude,
      longitude,
      openingTime,
      closingTime,
      themeColor,
      ownerEmail,
      ownerName,
      ownerPassword,
    } = body

    if (!name || !slug || !ownerEmail || !ownerName || !ownerPassword) {
      return NextResponse.json(
        { error: 'Nombre, slug, email, nombre y contraseña del dueño son requeridos' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingShop = await db.shop.findUnique({ where: { slug } })
    if (existingShop) {
      return NextResponse.json({ error: 'El slug ya está en uso' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email: ownerEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }

    // Hash the password
    const { hashPassword } = await import('@/lib/auth')
    const passwordHash = await hashPassword(ownerPassword)

    // Create user and shop in a transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: ownerEmail,
          passwordHash,
          name: ownerName,
          role: 'shop_admin',
        },
      })

      const shop = await tx.shop.create({
        data: {
          name,
          slug,
          description: description || null,
          whatsappNumber: whatsappNumber || '',
          instagram: instagram || null,
          facebook: facebook || null,
          address: address || null,
          googleMapsUrl: googleMapsUrl || null,
          latitude: latitude || null,
          longitude: longitude || null,
          openingTime: openingTime || '9:00 AM',
          closingTime: closingTime || '7:00 PM',
          themeColor: themeColor || '#D4A853',
          ownerId: user.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Update user with shopId
      await tx.user.update({
        where: { id: user.id },
        data: { shopId: shop.id },
      })

      return shop
    })

    return NextResponse.json({ shop: result }, { status: 201 })
  } catch (error) {
    console.error('Error creating shop:', error)
    return NextResponse.json({ error: 'Error al crear la barbería' }, { status: 500 })
  }
}

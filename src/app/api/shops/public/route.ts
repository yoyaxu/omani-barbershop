import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shops/public - List active shops (no auth required)
export async function GET() {
  try {
    const shops = await db.shop.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        whatsappNumber: true,
        themeColor: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ shops })
  } catch (error) {
    console.error('Error fetching public shops:', error)
    return NextResponse.json({ shops: [] })
  }
}

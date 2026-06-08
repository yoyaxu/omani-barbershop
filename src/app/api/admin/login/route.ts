import { db, ensureDbInitialized, verifyPassword } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/login - Verify admin password
export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized()
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Contraseña requerida' },
        { status: 400 }
      )
    }

    const admin = await db.adminSettings.findUnique({ where: { id: 'admin' } })
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin no configurado' },
        { status: 500 }
      )
    }

    const isValid = await verifyPassword(password, admin.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, email: admin.email, phone: admin.phone })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}

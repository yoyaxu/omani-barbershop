import { db, ensureDbInitialized, verifyPassword, hashPassword } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/change-password - Change admin password
export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized()
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Contraseña actual y nueva contraseña son requeridas' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 6 caracteres' },
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

    // Verify current password
    const isValid = await verifyPassword(currentPassword, admin.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 401 }
      )
    }

    // Hash and save new password
    const newHash = await hashPassword(newPassword)
    await db.adminSettings.update({
      where: { id: 'admin' },
      data: { password: newHash },
    })

    return NextResponse.json({ success: true, message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Error al cambiar la contraseña' },
      { status: 500 }
    )
  }
}

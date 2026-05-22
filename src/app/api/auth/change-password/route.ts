import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, hashPassword, verifyPassword } from '@/lib/auth'
import { db } from '@/lib/db'

// POST - Change password
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Ambas contraseñas son requeridas' },
        { status: 400 }
      )
    }

    // Get user's current password hash
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { passwordHash: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 401 }
      )
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 4 caracteres' },
        { status: 400 }
      )
    }

    // Hash and save new password
    const newPasswordHash = await hashPassword(newPassword)
    await db.user.update({
      where: { id: auth.userId },
      data: { passwordHash: newPasswordHash },
    })

    return NextResponse.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Error al cambiar la contraseña' }, { status: 500 })
  }
}

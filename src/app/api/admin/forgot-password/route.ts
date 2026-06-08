import { db, ensureDbInitialized, hashPassword } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/forgot-password - Request password reset
// Generates a temporary reset code and returns recovery instructions
export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized()
    const { email } = await request.json()

    const admin = await db.adminSettings.findUnique({ where: { id: 'admin' } })
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin no configurado' },
        { status: 500 }
      )
    }

    // Verify the email matches
    if (email && email.toLowerCase() !== admin.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'El correo no coincide con el del administrador' },
        { status: 404 }
      )
    }

    // Generate a temporary reset code (6 digits)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Hash the reset code and store it temporarily as the new password
    // The admin will use this code to log in, then change the password
    const resetHash = await hashPassword(resetCode)
    await db.adminSettings.update({
      where: { id: 'admin' },
      data: { password: resetHash },
    })

    // Return the reset code and admin WhatsApp for notification
    return NextResponse.json({
      success: true,
      resetCode,
      adminPhone: admin.phone,
      adminEmail: admin.email,
      message: 'Se ha generado un código de recuperación. Úsalo para iniciar sesión y luego cambia tu contraseña.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

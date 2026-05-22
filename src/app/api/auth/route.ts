import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, createSessionToken, verifyPassword } from '@/lib/auth'
import { db } from '@/lib/db'

// POST - Login with email/password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Create session token
    const { token, expiresAt } = createSessionToken(user.id, user.role, user.shopId || undefined)

    const response = NextResponse.json(
      {
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          shopId: user.shopId,
        },
      },
      { status: 200 }
    )

    // Set HTTP-only cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}

// GET - Check if authenticated
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if (auth.authenticated) {
      // Get user details
      const user = auth.userId
        ? await db.user.findUnique({
            where: { id: auth.userId },
            select: { id: true, name: true, email: true, role: true, shopId: true },
          })
        : null

      return NextResponse.json({
        authenticated: true,
        user,
      })
    }
    return NextResponse.json({ authenticated: false, user: null })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false, user: null })
  }
}

// DELETE - Logout
export async function DELETE() {
  const response = NextResponse.json(
    { message: 'Sesión cerrada' },
    { status: 200 }
  )

  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  })

  return response
}

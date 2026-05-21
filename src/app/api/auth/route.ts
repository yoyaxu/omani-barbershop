import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, verifyToken } from '@/lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'omani2024';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Contraseña requerida' },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Create session token (no database needed)
    const { token, expiresAt } = createSessionToken();

    const response = NextResponse.json(
      { message: 'Inicio de sesión exitoso' },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const isValid = verifyToken(token);
    return NextResponse.json({ authenticated: isValid });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json(
    { message: 'Sesión cerrada' },
    { status: 200 }
  );

  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });

  return response;
}

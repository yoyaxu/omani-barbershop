import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'omani2024';
const SESSION_DURATION_HOURS = 24;

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

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

    await db.adminSession.create({
      data: {
        token,
        expiresAt,
      },
    });

    const response = NextResponse.json(
      { message: 'Inicio de sesión exitoso', token },
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

export async function GET() {
  try {
    // Check if any valid session exists (for checking auth status)
    const now = new Date();
    const session = await db.adminSession.findFirst({
      where: {
        expiresAt: {
          gt: now,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ authenticated: !!session });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (token) {
      await db.adminSession.deleteMany({
        where: { token },
      });
    }

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
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}

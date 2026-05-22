import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, verifyToken } from '@/lib/auth';
import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'omani-barbershop-secret-key-2024';

function getValidPasswords(request: NextRequest): string[] {
  const passwords = [process.env.ADMIN_PASSWORD || 'omani2024'];

  // Also check if a custom password was set via cookie
  const customPwHash = request.cookies.get('admin_custom_pw')?.value;
  // We can't reverse the hash, so we also store the custom password encrypted
  // Actually, let's use a different approach - store the custom password in a separate cookie
  const customPw = request.cookies.get('admin_custom_pw_plain')?.value;
  if (customPw) {
    passwords.push(customPw);
  }

  return passwords;
}

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

    // Check against all valid passwords (env + custom)
    const validPasswords = getValidPasswords(request);
    if (!validPasswords.includes(password)) {
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

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin is authenticated
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Ambas contraseñas son requeridas' },
        { status: 400 }
      );
    }

    // Verify current password (check env var + custom cookie)
    const envPassword = process.env.ADMIN_PASSWORD || 'omani2024';
    const customPw = request.cookies.get('admin_custom_pw_plain')?.value;
    const validPasswords = [envPassword];
    if (customPw) validPasswords.push(customPw);

    if (!validPasswords.includes(currentPassword)) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 401 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 4 caracteres' },
        { status: 400 }
      );
    }

    const response = NextResponse.json(
      { message: 'Contraseña actualizada exitosamente' },
      { status: 200 }
    );

    // Store the new password in a long-lived cookie
    response.cookies.set('admin_custom_pw_plain', newPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Error al cambiar la contraseña' },
      { status: 500 }
    );
  }
}

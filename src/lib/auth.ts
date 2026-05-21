import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) return false;

    const session = await db.adminSession.findUnique({
      where: { token },
    });

    if (!session) return false;

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      await db.adminSession.delete({ where: { token } });
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

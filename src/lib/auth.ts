import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'omani-barbershop-secret-key-2024';
const SESSION_DURATION_HOURS = 24;

// ─── Token-based auth (no database needed) ───────────────────────

export function createSessionToken(): { token: string; expiresAt: Date } {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  // Create a token: randomPart.timestamp.signature
  const randomPart = crypto.randomBytes(16).toString('hex');
  const timestamp = expiresAt.getTime().toString(36);
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${randomPart}.${timestamp}`)
    .digest('hex');

  const token = `${randomPart}.${timestamp}.${signature}`;

  return { token, expiresAt };
}

export function verifyToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [randomPart, timestamp, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(`${randomPart}.${timestamp}`)
      .digest('hex');

    if (signature !== expectedSignature) return false;

    // Check expiry
    const expiresAt = parseInt(timestamp, 36);
    if (Date.now() > expiresAt) return false;

    return true;
  } catch {
    return false;
  }
}

// ─── Cookie-based admin verification ─────────────────────────────

export async function verifyAdmin(request?: Request): Promise<boolean> {
  try {
    let token: string | undefined;

    if (request) {
      // Get token from request cookies
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/admin_token=([^;]+)/);
      token = match?.[1];
    } else {
      // Server-side: use next/headers
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      token = cookieStore.get('admin_token')?.value;
    }

    if (!token) return false;
    return verifyToken(token);
  } catch {
    return false;
  }
}

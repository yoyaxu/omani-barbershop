import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { db } from './db'

const AUTH_SECRET = process.env.AUTH_SECRET || 'barberdo-saas-secret-key-2024'
const SESSION_DURATION_HOURS = 24

// ─── Token-based session auth ────────────────────────────────────

export function createSessionToken(userId: string, role: string, shopId?: string): { token: string; expiresAt: Date } {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS)

  const randomPart = crypto.randomBytes(16).toString('hex')
  const timestamp = expiresAt.getTime().toString(36)
  const payload = `${userId}.${role}.${shopId || ''}.${randomPart}.${timestamp}`
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('hex')

  const token = `${payload}.${signature}`

  return { token, expiresAt }
}

export function verifyToken(token: string): { valid: boolean; userId?: string; role?: string; shopId?: string } {
  try {
    const parts = token.split('.')
    if (parts.length !== 6) return { valid: false }

    const [userId, role, shopId, randomPart, timestamp, signature] = parts

    const payload = `${userId}.${role}.${shopId}.${randomPart}.${timestamp}`
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payload)
      .digest('hex')

    if (signature !== expectedSignature) return { valid: false }

    const expiresAt = parseInt(timestamp, 36)
    if (Date.now() > expiresAt) return { valid: false }

    return {
      valid: true,
      userId,
      role,
      shopId: shopId || undefined,
    }
  } catch {
    return { valid: false }
  }
}

// ─── Cookie-based admin verification ─────────────────────────────

export async function verifyAdmin(request?: Request): Promise<{ authenticated: boolean; userId?: string; role?: string; shopId?: string }> {
  try {
    let token: string | undefined

    if (request) {
      const cookieHeader = request.headers.get('cookie') || ''
      const match = cookieHeader.match(/admin_token=([^;]+)/)
      token = match?.[1]
    } else {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      token = cookieStore.get('admin_token')?.value
    }

    if (!token) return { authenticated: false }

    const result = verifyToken(token)
    if (!result.valid) return { authenticated: false }

    return {
      authenticated: true,
      userId: result.userId,
      role: result.role,
      shopId: result.shopId,
    }
  } catch {
    return { authenticated: false }
  }
}

// ─── Password hashing ────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── Shop slug resolution ────────────────────────────────────────

export async function getShopBySlug(slug: string) {
  return db.shop.findUnique({
    where: { slug },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
      galleryImages: {
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function getShopIdFromRequest(request: Request): Promise<string | null> {
  // Try header first (set by middleware)
  const slug = request.headers.get('x-shop-slug')
  if (slug) {
    const shop = await db.shop.findUnique({
      where: { slug },
      select: { id: true },
    })
    return shop?.id || null
  }

  // Try URL parameter (for direct access)
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const shopIndex = pathParts.indexOf('shop')
  if (shopIndex !== -1 && pathParts[shopIndex + 1]) {
    const shopSlug = pathParts[shopIndex + 1]
    const shop = await db.shop.findUnique({
      where: { slug: shopSlug },
      select: { id: true },
    })
    return shop?.id || null
  }

  return null
}

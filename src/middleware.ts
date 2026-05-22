import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Extract subdomain from hostname
  // localhost:3000 → no subdomain
  // omani.localhost:3000 → "omani"
  // omani.barberdo.com → "omani"
  // www.barberdo.com → no subdomain (www is ignored)
  // barberdo.com → no subdomain

  const isLocalhost = hostname.includes('localhost')
  const domainParts = hostname.split('.')

  let subdomain: string | null = null

  if (isLocalhost) {
    // localhost:3000 → domainParts = ['localhost:3000']
    // omani.localhost:3000 → domainParts = ['omani', 'localhost:3000']
    if (domainParts.length >= 2 && domainParts[0] !== 'www') {
      subdomain = domainParts[0]
    }
  } else {
    // barberdo.com → domainParts = ['barberdo', 'com']
    // omani.barberdo.com → domainParts = ['omani', 'barberdo', 'com']
    // www.barberdo.com → domainParts = ['www', 'barberdo', 'com']
    if (domainParts.length >= 3 && domainParts[0] !== 'www') {
      subdomain = domainParts[0]
    }
  }

  // If we have a subdomain, rewrite to /shop/[slug]
  if (subdomain) {
    // Skip if already on a shop route (prevent infinite loops)
    if (url.pathname.startsWith('/shop/')) {
      return NextResponse.next()
    }

    // Skip API routes - they handle shop context internally
    if (url.pathname.startsWith('/api/')) {
      // Add shop slug as a header for API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-shop-slug', subdomain)
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    // Rewrite to the shop route
    url.pathname = `/shop/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|logo.*|hero.*|gallery.*|service.*|robots\\.txt).*)',
  ],
}

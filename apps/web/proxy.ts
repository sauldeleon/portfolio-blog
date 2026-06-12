import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { auth } from './lib/auth/config'
import { ratelimit } from './lib/ratelimit'

type AuthRequest = NextRequest & {
  ip?: string
  auth?: { user?: unknown } | null
}

export async function handleMiddleware(
  req: AuthRequest,
): Promise<Response | undefined> {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  if (pathname === '/api/auth/callback/credentials' && req.method === 'POST') {
    if (ratelimit) {
      const ip = req.ip ?? '127.0.0.1'
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429, headers: { 'Retry-After': '60' } },
        )
      }
    }
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  const method = req.method
  const isWriteMethod = ['POST', 'PUT', 'DELETE'].includes(method)
  const isLikeEndpoint = /^\/api\/posts\/[^/]+\/like\/?$/.test(pathname)
  const isProtectedApi =
    !isLikeEndpoint &&
    (pathname.startsWith('/api/posts') ||
      pathname.startsWith('/api/categories') ||
      pathname === '/api/upload')

  if (isProtectedApi && isWriteMethod && !isAuthenticated) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
}

export default auth(handleMiddleware)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/posts/:path*',
    '/api/categories/:path*',
    '/api/upload',
    '/api/auth/callback/credentials',
  ],
}

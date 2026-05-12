import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { auth } from './lib/auth/config'

type AuthRequest = NextRequest & { auth?: { user?: unknown } | null }

export function handleMiddleware(req: AuthRequest): Response | undefined {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  const method = req.method
  const isWriteMethod = ['POST', 'PUT', 'DELETE'].includes(method)
  const isProtectedApi =
    pathname.startsWith('/api/posts') ||
    pathname.startsWith('/api/categories') ||
    pathname === '/api/upload'

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
  ],
}

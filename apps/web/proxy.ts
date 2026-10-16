import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { LANGUAGE_COOKIE } from './i18n/languages'
import { auth } from './lib/auth/config'
import { ratelimit } from './lib/ratelimit'
import { isServeableBlogPath } from './lib/routing/isServeableBlogPath'
import { preferredLanguage } from './lib/routing/preferredLanguage'

type AuthRequest = NextRequest & {
  ip?: string
  auth?: { user?: unknown } | null
}

export async function handleMiddleware(
  req: AuthRequest,
): Promise<Response | void> {
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
  const isCommentsEndpoint = /^\/api\/posts\/[^/]+\/comments\/?$/.test(pathname)
  const isPublicPostWriteEndpoint = isLikeEndpoint || isCommentsEndpoint
  const isProtectedApi =
    !isPublicPostWriteEndpoint &&
    (pathname.startsWith('/api/posts') ||
      pathname.startsWith('/api/categories') ||
      pathname === '/api/upload')

  if (isProtectedApi && isWriteMethod && !isAuthenticated) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
}

const SESSION_COOKIE = /^(__Secure-)?authjs\.session-token(\.\d+)?=/

/**
 * Auth.js re-issues the session cookie on every request the proxy handles,
 * sliding its expiry. Any such response that lands after logout (an RSC
 * navigation, a router prefetch, an admin API fetch, or the logout server
 * action itself) put the session back. The proxy only reads the session now:
 * it ends maxAge after login, and only sign-in and sign-out write the cookie.
 */
export function withoutSessionRefresh(response: Response): Response {
  const cookies = response.headers.getSetCookie()
  const kept = cookies.filter((cookie) => !SESSION_COOKIE.test(cookie))
  if (kept.length === cookies.length) return response

  const headers = new Headers(response.headers)
  headers.delete('set-cookie')
  kept.forEach((cookie) => headers.append('set-cookie', cookie))
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

const authProxy = auth(handleMiddleware)

const PUBLIC_BLOG_PATH = /^\/[^/]+\/blog(\/|$)/

export default async function proxy(
  ...args: Parameters<typeof authProxy>
): Promise<Response | void> {
  const [req] = args
  const { pathname } = req.nextUrl
  // Send `/` straight to the visitor's language on the server, instead of a
  // client page that redirects after its JavaScript loads.
  if (pathname === '/') {
    const lng = preferredLanguage(
      req.cookies.get(LANGUAGE_COOKIE)?.value,
      req.headers.get('accept-language'),
    )
    return NextResponse.redirect(new URL(`/${lng}/`, req.url))
  }
  // Public blog pages need no session: only guard their URL shape.
  if (PUBLIC_BLOG_PATH.test(pathname)) {
    return isServeableBlogPath(pathname)
      ? undefined
      : new NextResponse(null, { status: 404 })
  }
  const response = await authProxy(...args)
  return response ? withoutSessionRefresh(response) : response
}

export const config = {
  matcher: [
    '/',
    '/:lng/blog/:path*',
    '/admin/:path*',
    '/api/posts/:path*',
    '/api/categories/:path*',
    '/api/upload',
    '/api/auth/callback/credentials',
  ],
}

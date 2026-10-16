/**
 * @vitest-environment node
 */
import type { Mock } from 'vitest'

const mockRatelimitLimit = vi.fn()
let mockRatelimit: { limit: Mock } | null = { limit: mockRatelimitLimit }

vi.mock('./lib/auth/config', () => ({
  auth: (fn: unknown) => fn,
}))

vi.mock('./lib/ratelimit', () => ({
  get ratelimit() {
    return mockRatelimit
  },
}))

type AuthRequest = {
  nextUrl: URL
  url: string
  method: string
  ip?: string
  auth?: { user?: unknown } | null
}

const {
  handleMiddleware,
  withoutSessionRefresh,
  default: proxy,
} = (await import('./proxy')) as unknown as {
  handleMiddleware: (req: AuthRequest) => Promise<Response | undefined>
  withoutSessionRefresh: (response: Response) => Response
  default: (req: AuthRequest) => Promise<Response | void>
}

function makeReq(
  pathname: string,
  method = 'GET',
  auth: AuthRequest['auth'] = null,
  ip?: string,
): AuthRequest {
  const url = `http://localhost${pathname}`
  return { nextUrl: new URL(url), url, method, auth, ip }
}

describe('handleMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRatelimit = { limit: mockRatelimitLimit }
    mockRatelimitLimit.mockResolvedValue({ success: true })
  })

  describe('admin routes', () => {
    it('redirects unauthenticated requests to /admin/*', async () => {
      const req = makeReq('/admin/posts')
      const res = await handleMiddleware(req)
      expect(res).toBeDefined()
      expect((res as Response).status).toBe(307)
      expect((res as Response).headers.get('location')).toContain(
        '/admin/login',
      )
    })

    it('allows authenticated requests to /admin/*', async () => {
      const req = makeReq('/admin/posts', 'GET', { user: { name: 'admin' } })
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows all requests to /admin/login', async () => {
      const req = makeReq('/admin/login')
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })
  })

  describe('protected API routes', () => {
    it('returns 401 for unauthenticated POST /api/posts', async () => {
      const req = makeReq('/api/posts', 'POST')
      const res = await handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated PUT /api/posts/id', async () => {
      const req = makeReq('/api/posts/some-id', 'PUT')
      const res = await handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated DELETE /api/posts/id', async () => {
      const req = makeReq('/api/posts/some-id', 'DELETE')
      const res = await handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated POST /api/categories', async () => {
      const req = makeReq('/api/categories', 'POST')
      const res = await handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated PUT /api/categories/slug', async () => {
      const req = makeReq('/api/categories/engineering', 'PUT')
      const res = await handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated DELETE /api/categories/slug', async () => {
      const req = makeReq('/api/categories/engineering', 'DELETE')
      const res = await handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated POST /api/upload', async () => {
      const req = makeReq('/api/upload', 'POST')
      const res = await handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('allows authenticated write requests to /api/posts', async () => {
      const req = makeReq('/api/posts', 'POST', { user: { name: 'admin' } })
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows authenticated write requests to /api/categories', async () => {
      const req = makeReq('/api/categories', 'POST', {
        user: { name: 'admin' },
      })
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows GET requests to /api/posts without auth', async () => {
      const req = makeReq('/api/posts', 'GET')
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows unauthenticated POST /api/posts/:id/like', async () => {
      const req = makeReq('/api/posts/01KTS15Y8MWBG5WXWE2EJASF32/like', 'POST')
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows unauthenticated POST /api/posts/:id/like with trailing slash', async () => {
      const req = makeReq('/api/posts/01KTS15Y8MWBG5WXWE2EJASF32/like/', 'POST')
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows unauthenticated POST /api/posts/:id/comments', async () => {
      const req = makeReq(
        '/api/posts/01KTS15Y8MWBG5WXWE2EJASF32/comments',
        'POST',
      )
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows unauthenticated POST /api/posts/:id/comments with trailing slash', async () => {
      const req = makeReq(
        '/api/posts/01KTS15Y8MWBG5WXWE2EJASF32/comments/',
        'POST',
      )
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows GET requests to /api/categories without auth', async () => {
      const req = makeReq('/api/categories', 'GET')
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows authenticated POST /api/upload', async () => {
      const req = makeReq('/api/upload', 'POST', { user: { name: 'admin' } })
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
    })
  })

  describe('rate limiting on /api/auth/callback/credentials', () => {
    it('allows request when rate limit check passes', async () => {
      mockRatelimitLimit.mockResolvedValue({ success: true })
      const req = makeReq(
        '/api/auth/callback/credentials',
        'POST',
        null,
        '1.2.3.4',
      )
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
      expect(mockRatelimitLimit).toHaveBeenCalledWith('1.2.3.4')
    })

    it('returns 429 with Retry-After header when rate limit exceeded', async () => {
      mockRatelimitLimit.mockResolvedValue({ success: false })
      const req = makeReq(
        '/api/auth/callback/credentials',
        'POST',
        null,
        '1.2.3.4',
      )
      const res = await handleMiddleware(req)
      expect((res as Response).status).toBe(429)
      expect((res as Response).headers.get('Retry-After')).toBe('60')
    })

    it('falls back to 127.0.0.1 when ip is undefined', async () => {
      mockRatelimitLimit.mockResolvedValue({ success: true })
      const req = makeReq('/api/auth/callback/credentials', 'POST')
      await handleMiddleware(req)
      expect(mockRatelimitLimit).toHaveBeenCalledWith('127.0.0.1')
    })

    it('skips rate limit check for GET requests', async () => {
      const req = makeReq('/api/auth/callback/credentials', 'GET')
      await handleMiddleware(req)
      expect(mockRatelimitLimit).not.toHaveBeenCalled()
    })

    it('allows request when ratelimit is null (Redis not configured)', async () => {
      mockRatelimit = null
      const req = makeReq('/api/auth/callback/credentials', 'POST')
      const res = await handleMiddleware(req)
      expect(res).toBeUndefined()
      expect(mockRatelimitLimit).not.toHaveBeenCalled()
    })
  })

  describe('withoutSessionRefresh', () => {
    it('drops session cookies and keeps the rest of the response', async () => {
      const headers = new Headers({ location: '/admin/login' })
      headers.append('set-cookie', '__Secure-authjs.session-token=abc; Path=/')
      headers.append('set-cookie', 'authjs.session-token.0=part; Path=/')
      headers.append('set-cookie', 'authjs.csrf-token=xyz; Path=/')
      const response = new Response('body', {
        status: 307,
        statusText: 'Temporary Redirect',
        headers,
      })

      const result = withoutSessionRefresh(response)

      expect(result.headers.getSetCookie()).toEqual([
        'authjs.csrf-token=xyz; Path=/',
      ])
      expect(result.status).toBe(307)
      expect(result.statusText).toBe('Temporary Redirect')
      expect(result.headers.get('location')).toBe('/admin/login')
      expect(await result.text()).toBe('body')
    })

    it('returns the same response when it sets no session cookie', () => {
      const response = new Response(null, {
        headers: { 'set-cookie': 'other=1; Path=/' },
      })
      expect(withoutSessionRefresh(response)).toBe(response)
    })
  })

  describe('default export', () => {
    it('passes through when the handler lets the request continue', async () => {
      await expect(
        proxy(makeReq('/admin/posts', 'GET', { user: {} })),
      ).resolves.toBeUndefined()
    })

    it('returns the handler response without session cookies', async () => {
      const res = await proxy(makeReq('/admin/posts'))
      expect(res?.status).toBe(307)
      expect(res?.headers.getSetCookie()).toEqual([])
    })

    it('lets a well-formed blog URL through without touching the session', async () => {
      await expect(
        proxy(makeReq('/en/blog/547/from-valle-de-pineta-to-tucarroya/')),
      ).resolves.toBeUndefined()
    })

    it('answers an impossible blog URL with a 404 before it reaches the cache', async () => {
      const res = await proxy(makeReq('/en/blog/not-a-number/junk/extra/'))
      expect(res?.status).toBe(404)
    })
  })
})

export {}

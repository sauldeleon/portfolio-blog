/**
 * @jest-environment node
 */
const mockRatelimitLimit = jest.fn()
let mockRatelimit: { limit: jest.Mock } | null = { limit: mockRatelimitLimit }

jest.mock('./lib/auth/config', () => ({
  auth: (fn: unknown) => fn,
}))

jest.mock('./lib/ratelimit', () => ({
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

const { handleMiddleware } = require('./proxy') as {
  handleMiddleware: (req: AuthRequest) => Promise<Response | undefined>
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
    jest.clearAllMocks()
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
})

export {}

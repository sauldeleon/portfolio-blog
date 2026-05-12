/**
 * @jest-environment node
 */
jest.mock('./lib/auth/config', () => ({
  auth: (fn: unknown) => fn,
}))

type AuthRequest = {
  nextUrl: URL
  url: string
  method: string
  auth?: { user?: unknown } | null
}

const { handleMiddleware } = require('./proxy') as {
  handleMiddleware: (req: AuthRequest) => Response | undefined
}

function makeReq(
  pathname: string,
  method = 'GET',
  auth: AuthRequest['auth'] = null,
): AuthRequest {
  const url = `http://localhost${pathname}`
  return { nextUrl: new URL(url), url, method, auth }
}

describe('handleMiddleware', () => {
  describe('admin routes', () => {
    it('redirects unauthenticated requests to /admin/*', () => {
      const req = makeReq('/admin/posts')
      const res = handleMiddleware(req)
      expect(res).toBeDefined()
      expect((res as Response).status).toBe(307)
      expect((res as Response).headers.get('location')).toContain(
        '/admin/login',
      )
    })

    it('allows authenticated requests to /admin/*', () => {
      const req = makeReq('/admin/posts', 'GET', { user: { name: 'admin' } })
      const res = handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows all requests to /admin/login', () => {
      const req = makeReq('/admin/login')
      const res = handleMiddleware(req)
      expect(res).toBeUndefined()
    })
  })

  describe('protected API routes', () => {
    it('returns 401 for unauthenticated POST /api/posts', () => {
      const req = makeReq('/api/posts', 'POST')
      const res = handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated PUT /api/posts/id', () => {
      const req = makeReq('/api/posts/some-id', 'PUT')
      const res = handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated DELETE /api/posts/id', () => {
      const req = makeReq('/api/posts/some-id', 'DELETE')
      const res = handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated POST /api/categories', () => {
      const req = makeReq('/api/categories', 'POST')
      const res = handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated PUT /api/categories/slug', () => {
      const req = makeReq('/api/categories/engineering', 'PUT')
      const res = handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated DELETE /api/categories/slug', () => {
      const req = makeReq('/api/categories/engineering', 'DELETE')
      const res = handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('returns 401 for unauthenticated POST /api/upload', () => {
      const req = makeReq('/api/upload', 'POST')
      const res = handleMiddleware(req)
      expect((res as Response).status).toBe(401)
    })

    it('allows authenticated write requests to /api/posts', () => {
      const req = makeReq('/api/posts', 'POST', { user: { name: 'admin' } })
      const res = handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows authenticated write requests to /api/categories', () => {
      const req = makeReq('/api/categories', 'POST', {
        user: { name: 'admin' },
      })
      const res = handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows GET requests to /api/posts without auth', () => {
      const req = makeReq('/api/posts', 'GET')
      const res = handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows GET requests to /api/categories without auth', () => {
      const req = makeReq('/api/categories', 'GET')
      const res = handleMiddleware(req)
      expect(res).toBeUndefined()
    })

    it('allows authenticated POST /api/upload', () => {
      const req = makeReq('/api/upload', 'POST', { user: { name: 'admin' } })
      const res = handleMiddleware(req)
      expect(res).toBeUndefined()
    })
  })
})

export {}

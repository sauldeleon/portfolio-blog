/**
 * @vitest-environment node
 */
const mockAuth = vi.fn()

vi.mock('@web/lib/auth/config', () => ({
  auth: mockAuth,
}))

const { GET } = (await import('./route')) as { GET: () => Promise<Response> }

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no session', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await GET()
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('returns authenticated: true when session exists', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ authenticated: true })
  })
})

export {}

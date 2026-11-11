/**
 * @vitest-environment node
 */
const mockGetSubscriptionsAdmin = vi.fn()
const mockRequireAuth = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('@web/lib/db/queries/subscriptions', () => ({
  getSubscriptionsAdmin: () => mockGetSubscriptionsAdmin(),
}))
vi.mock('@web/lib/api/parseRequest', () => ({
  requireAuth: () => mockRequireAuth(),
}))
vi.mock('@web/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}))

const { GET } = (await import('./route')) as unknown as {
  GET: () => Promise<Response>
}

const mockSubscription = {
  id: 's1',
  email: 'reader@example.com',
  name: 'Reader',
  status: 'active',
  locale: 'en',
  createdAt: new Date('2024-01-01'),
  confirmedAt: new Date('2024-01-02'),
  enabled: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireAuth.mockResolvedValue({
    ok: true,
    session: { user: { role: 'editor' } },
  })
  mockGetSubscriptionsAdmin.mockResolvedValue([mockSubscription])
})

describe('GET /api/subscriptions', () => {
  it('returns subscriptions list', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = (await res.json()) as { subscriptions: unknown[] }
    expect(json.subscriptions).toHaveLength(1)
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      }),
    })
    const res = await GET()
    expect(res.status).toBe(401)
    expect(mockGetSubscriptionsAdmin).not.toHaveBeenCalled()
  })

  it('returns 500 when query throws', async () => {
    mockGetSubscriptionsAdmin.mockRejectedValue(new Error('db error'))
    const res = await GET()
    expect(res.status).toBe(500)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

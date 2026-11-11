/**
 * @vitest-environment node
 */
const mockUpdateSubscriptionById = vi.fn()
const mockRequireAuth = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('@web/lib/db/queries/subscriptions', () => ({
  updateSubscriptionById: (...args: unknown[]) =>
    mockUpdateSubscriptionById(...args),
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

const { PATCH } = (await import('./route')) as unknown as {
  PATCH: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>
}

const SUB_ID = 'sub-ulid-123'

function makeCtx(id = SUB_ID) {
  return { params: Promise.resolve({ id }) }
}

function makeRequest(body: unknown = { enabled: false }) {
  return new Request(`http://localhost/api/subscriptions/${SUB_ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireAuth.mockResolvedValue({
    ok: true,
    session: { user: { role: 'editor' } },
  })
  mockUpdateSubscriptionById.mockResolvedValue({ id: SUB_ID, enabled: false })
})

describe('PATCH /api/subscriptions/[id]', () => {
  it('updates enabled flag and returns subscription', async () => {
    const res = await PATCH(makeRequest(), makeCtx())
    expect(res.status).toBe(200)
    expect(mockUpdateSubscriptionById).toHaveBeenCalledWith(SUB_ID, {
      enabled: false,
    })
    const json = (await res.json()) as { subscription: { enabled: boolean } }
    expect(json.subscription.enabled).toBe(false)
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      }),
    })
    const res = await PATCH(makeRequest(), makeCtx())
    expect(res.status).toBe(401)
    expect(mockUpdateSubscriptionById).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await PATCH(makeRequest('not-json'), makeCtx())
    expect(res.status).toBe(400)
  })

  it('returns 400 when enabled is not a boolean', async () => {
    const res = await PATCH(makeRequest({ enabled: 'yes' }), makeCtx())
    expect(res.status).toBe(400)
    expect(mockUpdateSubscriptionById).not.toHaveBeenCalled()
  })

  it('updates name and locale', async () => {
    const res = await PATCH(
      makeRequest({ name: '  Ana  ', locale: 'es' }),
      makeCtx(),
    )
    expect(res.status).toBe(200)
    expect(mockUpdateSubscriptionById).toHaveBeenCalledWith(SUB_ID, {
      name: 'Ana',
      locale: 'es',
    })
  })

  it('returns 400 when the body is empty', async () => {
    const res = await PATCH(makeRequest({}), makeCtx())
    expect(res.status).toBe(400)
    expect(mockUpdateSubscriptionById).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid locale', async () => {
    const res = await PATCH(makeRequest({ locale: 'fr' }), makeCtx())
    expect(res.status).toBe(400)
  })

  it('returns 404 when subscription not found', async () => {
    mockUpdateSubscriptionById.mockResolvedValue(null)
    const res = await PATCH(makeRequest(), makeCtx())
    expect(res.status).toBe(404)
  })

  it('returns 500 when update throws', async () => {
    mockUpdateSubscriptionById.mockRejectedValue(new Error('db error'))
    const res = await PATCH(makeRequest(), makeCtx())
    expect(res.status).toBe(500)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

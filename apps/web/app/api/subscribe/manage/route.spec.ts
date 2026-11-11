/**
 * @vitest-environment node
 */
const mockUpdateSubscriptionByToken = vi.fn()
const mockLimit = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('@web/lib/ratelimit', () => ({ ratelimit: { limit: mockLimit } }))
vi.mock('@web/lib/db/queries/subscriptions', () => ({
  updateSubscriptionByToken: (...args: unknown[]) =>
    mockUpdateSubscriptionByToken(...args),
}))
const mockVerifyManageLink = vi.fn()
vi.mock('@web/lib/subscriptions/manageLink', () => ({
  verifyManageLink: (...args: unknown[]) => mockVerifyManageLink(...args),
}))
vi.mock('@web/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}))

type PatchFn = (req: Request) => Promise<Response>

const { PATCH } = (await import('./route')) as unknown as { PATCH: PatchFn }

const validBody = {
  token: 'tok-1',
  expires: '123',
  signature: 'sig',
  name: '  Ana  ',
  locale: 'es',
}

function makeRequest(body: unknown = validBody) {
  return new Request('http://localhost/api/subscribe/manage', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '1.2.3.4',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockLimit.mockResolvedValue({ success: true })
  mockVerifyManageLink.mockReturnValue('valid')
  mockUpdateSubscriptionByToken.mockResolvedValue({
    id: 's1',
    email: 'ana@example.com',
    name: 'Ana',
    locale: 'es',
  })
})

describe('PATCH /api/subscribe/manage', () => {
  it('updates name and locale and returns only those fields', async () => {
    const res = await PATCH(makeRequest())
    expect(res.status).toBe(200)
    expect(mockLimit).toHaveBeenCalledWith('subscribe-manage:1.2.3.4')
    expect(mockUpdateSubscriptionByToken).toHaveBeenCalledWith('tok-1', {
      name: 'Ana',
      locale: 'es',
    })
    expect(await res.json()).toEqual({
      subscription: { name: 'Ana', locale: 'es' },
    })
  })

  it('checks the signed link', async () => {
    await PATCH(makeRequest())
    expect(mockVerifyManageLink).toHaveBeenCalledWith({
      token: 'tok-1',
      expires: '123',
      signature: 'sig',
    })
  })

  it('returns 410 for an expired link', async () => {
    mockVerifyManageLink.mockReturnValue('expired')
    const res = await PATCH(makeRequest())
    expect(res.status).toBe(410)
    expect(mockUpdateSubscriptionByToken).not.toHaveBeenCalled()
  })

  it('returns 403 for an invalid link', async () => {
    mockVerifyManageLink.mockReturnValue('invalid')
    const res = await PATCH(makeRequest())
    expect(res.status).toBe(403)
    expect(mockUpdateSubscriptionByToken).not.toHaveBeenCalled()
  })

  it('returns 400 when the signature is missing', async () => {
    const res = await PATCH(makeRequest({ ...validBody, signature: undefined }))
    expect(res.status).toBe(400)
  })

  it('returns 429 when rate limited', async () => {
    mockLimit.mockResolvedValue({ success: false })
    const res = await PATCH(makeRequest())
    expect(res.status).toBe(429)
    expect(mockUpdateSubscriptionByToken).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await PATCH(makeRequest('nope'))
    expect(res.status).toBe(400)
  })

  it('returns 400 when the token is missing', async () => {
    const res = await PATCH(makeRequest({ ...validBody, token: undefined }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for a blank name', async () => {
    const res = await PATCH(makeRequest({ ...validBody, name: '   ' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 for an unknown token', async () => {
    mockUpdateSubscriptionByToken.mockResolvedValue(null)
    const res = await PATCH(makeRequest())
    expect(res.status).toBe(404)
  })

  it('returns 500 when the update throws', async () => {
    mockUpdateSubscriptionByToken.mockRejectedValue(new Error('db'))
    const res = await PATCH(makeRequest())
    expect(res.status).toBe(500)
    expect(mockLoggerError).toHaveBeenCalled()
  })

  it('skips rate limiting when ratelimit is not configured', async () => {
    vi.resetModules()
    vi.doMock('@web/lib/ratelimit', () => ({ ratelimit: null }))
    const { PATCH: patchFn } = (await import('./route')) as unknown as {
      PATCH: PatchFn
    }
    const res = await patchFn(makeRequest())
    expect(res.status).toBe(200)
    expect(mockLimit).not.toHaveBeenCalled()
  })
})

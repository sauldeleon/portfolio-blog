/**
 * @jest-environment node
 */
const mockRatelimit = { limit: jest.fn() }
const mockGetSubscriptionByEmail = jest.fn()
const mockCreateSubscription = jest.fn()
const mockSendConfirmationEmail = jest.fn()
const mockVerifyTurnstile = jest.fn()
const mockLoggerError = jest.fn()
const mockLoggerInfo = jest.fn()

jest.mock('@web/lib/ratelimit', () => ({ ratelimit: mockRatelimit }))
jest.mock('@web/lib/db/queries/subscriptions', () => ({
  getSubscriptionByEmail: mockGetSubscriptionByEmail,
  createSubscription: mockCreateSubscription,
}))
jest.mock('@web/lib/email/sendConfirmationEmail', () => ({
  sendConfirmationEmail: mockSendConfirmationEmail,
}))
jest.mock('@web/lib/turnstile/verify', () => ({
  verifyTurnstile: mockVerifyTurnstile,
}))
jest.mock('@web/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    info: mockLoggerInfo,
    debug: jest.fn(),
    warn: jest.fn(),
  },
}))

const { POST } = require('./route') as {
  POST: (req: import('next/server').NextRequest) => Promise<Response>
}

const translations = {
  subject: 'Confirm',
  previewText: 'Preview',
  heading: 'Heading',
  body: 'Hi {{name}}',
  buttonLabel: 'Confirm',
  footerText: 'Footer',
  unsubscribeText: 'Unsubscribe',
}

function makeRequest(body: unknown, ip = '1.2.3.4') {
  return new Request('http://localhost/api/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  }) as import('next/server').NextRequest
}

const validBody = {
  name: 'Test User',
  email: 'test@example.com',
  turnstileToken: 'token',
  locale: 'en',
  translations,
}

const mockSubscription = {
  id: '01JWTEST',
  email: 'test@example.com',
  name: 'Test User',
  status: 'pending',
  token: 'abc123',
  locale: 'en',
  createdAt: new Date(),
  confirmedAt: null,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRatelimit.limit.mockResolvedValue({ success: true })
  mockVerifyTurnstile.mockResolvedValue(true)
  mockGetSubscriptionByEmail.mockResolvedValue(null)
  mockCreateSubscription.mockResolvedValue(mockSubscription)
  mockSendConfirmationEmail.mockResolvedValue(undefined)
})

describe('POST /api/subscribe', () => {
  it('returns 201 on new subscription', async () => {
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toEqual({ ok: true })
    expect(mockCreateSubscription).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      locale: 'en',
    })
    expect(mockSendConfirmationEmail).toHaveBeenCalledTimes(1)
  })

  it('returns 429 when rate limited', async () => {
    mockRatelimit.limit.mockResolvedValue({ success: false })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(429)
  })

  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    }) as import('next/server').NextRequest
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 on missing required fields', async () => {
    const res = await POST(makeRequest({ email: 'bad' }))
    expect(res.status).toBe(400)
  })

  it('silently returns 200 when honeypot filled', async () => {
    const res = await POST(makeRequest({ ...validBody, honeypot: 'bot' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true })
    expect(mockCreateSubscription).not.toHaveBeenCalled()
  })

  it('returns 422 when turnstile verification fails', async () => {
    mockVerifyTurnstile.mockResolvedValue(false)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(422)
  })

  it('returns 200 with alreadySubscribed=true when active subscription exists', async () => {
    mockGetSubscriptionByEmail.mockResolvedValue({
      ...mockSubscription,
      status: 'active',
    })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true, alreadySubscribed: true })
    expect(mockCreateSubscription).not.toHaveBeenCalled()
  })

  it('returns 200 with alreadySubscribed=true for pending subscription', async () => {
    mockGetSubscriptionByEmail.mockResolvedValue({
      ...mockSubscription,
      status: 'pending',
    })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.alreadySubscribed).toBe(true)
  })

  it('re-subscribes unsubscribed email without creating new record', async () => {
    const unsubscribed = { ...mockSubscription, status: 'unsubscribed' }
    mockGetSubscriptionByEmail.mockResolvedValue(unsubscribed)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
    expect(mockCreateSubscription).not.toHaveBeenCalled()
    expect(mockSendConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'abc123' }),
    )
  })

  it('returns 500 on database error', async () => {
    mockCreateSubscription.mockRejectedValue(new Error('DB error'))
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(500)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

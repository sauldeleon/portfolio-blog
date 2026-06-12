/**
 * @jest-environment node
 */
const mockGetPostStatus = jest.fn()
const mockIncrementPostLikes = jest.fn()
const mockLikesRatelimit = { limit: jest.fn() }
const mockLoggerError = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostStatus: (...args: unknown[]) => mockGetPostStatus(...args),
  incrementPostLikes: (...args: unknown[]) => mockIncrementPostLikes(...args),
}))
jest.mock('@web/lib/ratelimit', () => ({
  get likesRatelimit() {
    return mockLikesRatelimit
  },
}))
jest.mock('@web/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}))

const { POST } = require('./route') as {
  POST: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>
}

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/posts/some-id/like', {
    method: 'POST',
    headers,
  })
}

function makeParams(id = 'post-ulid-123') {
  return { params: Promise.resolve({ id }) }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockLikesRatelimit.limit.mockResolvedValue({ success: true })
  mockGetPostStatus.mockResolvedValue('published')
  mockIncrementPostLikes.mockResolvedValue(42)
})

describe('POST /api/posts/[id]/like', () => {
  it('increments likes and returns count', async () => {
    const res = await POST(makeRequest(), makeParams())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ likes: 42 })
    expect(mockIncrementPostLikes).toHaveBeenCalledWith('post-ulid-123')
  })

  it('returns 429 when rate limit exceeded', async () => {
    mockLikesRatelimit.limit.mockResolvedValue({ success: false })
    const res = await POST(makeRequest(), makeParams())
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ error: 'Already liked' })
    expect(mockIncrementPostLikes).not.toHaveBeenCalled()
  })

  it('uses x-forwarded-for ip for rate limit key', async () => {
    const res = await POST(
      makeRequest({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }),
      makeParams(),
    )
    expect(res.status).toBe(200)
    expect(mockLikesRatelimit.limit).toHaveBeenCalledWith(
      'like:post-ulid-123:1.2.3.4',
    )
  })

  it('uses x-real-ip when x-forwarded-for absent', async () => {
    await POST(makeRequest({ 'x-real-ip': '9.9.9.9' }), makeParams())
    expect(mockLikesRatelimit.limit).toHaveBeenCalledWith(
      'like:post-ulid-123:9.9.9.9',
    )
  })

  it('falls back to anonymous when no ip headers', async () => {
    await POST(makeRequest(), makeParams())
    expect(mockLikesRatelimit.limit).toHaveBeenCalledWith(
      'like:post-ulid-123:anonymous',
    )
  })

  it('returns 404 when post not found', async () => {
    mockGetPostStatus.mockResolvedValue(null)
    const res = await POST(makeRequest(), makeParams())
    expect(res.status).toBe(404)
    expect(mockIncrementPostLikes).not.toHaveBeenCalled()
  })

  it('returns 404 when post is not published', async () => {
    mockGetPostStatus.mockResolvedValue('draft')
    const res = await POST(makeRequest(), makeParams())
    expect(res.status).toBe(404)
    expect(mockIncrementPostLikes).not.toHaveBeenCalled()
  })

  it('returns 500 when increment throws', async () => {
    mockIncrementPostLikes.mockRejectedValue(new Error('db error'))
    const res = await POST(makeRequest(), makeParams())
    expect(res.status).toBe(500)
    expect(mockLoggerError).toHaveBeenCalled()
  })

  it('skips rate limit when likesRatelimit is null', async () => {
    jest.resetModules()
    jest.mock('@web/lib/ratelimit', () => ({ likesRatelimit: null }))
    jest.mock('@web/lib/db/queries/posts', () => ({
      getPostStatus: () => Promise.resolve('published'),
      incrementPostLikes: () => Promise.resolve(1),
    }))
    jest.mock('@web/lib/logger', () => ({
      logger: {
        error: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
      },
    }))
    const { POST: POST2 } = require('./route') as typeof import('./route')
    const res = await POST2(makeRequest(), makeParams())
    expect(res.status).toBe(200)
  })
})

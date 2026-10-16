/**
 * @vitest-environment node
 */
const mockRedisConstructor = vi.fn()

vi.mock('@upstash/redis', () => ({
  Redis: function (...args: unknown[]) {
    mockRedisConstructor(...args)
    return { _isMockRedis: true }
  },
}))

describe('redis', () => {
  const originalUrl = process.env.KV_REST_API_URL
  const originalToken = process.env.KV_REST_API_TOKEN

  afterEach(() => {
    process.env.KV_REST_API_URL = originalUrl
    process.env.KV_REST_API_TOKEN = originalToken
    vi.resetModules()
    mockRedisConstructor.mockClear()
  })

  it('creates Redis instance when both env vars are set', async () => {
    process.env.KV_REST_API_URL = 'https://redis.example.com'
    process.env.KV_REST_API_TOKEN = 'test-token'
    vi.resetModules()
    const { redis } = (await import('./index')) as { redis: unknown }
    expect(redis).not.toBeNull()
    expect(mockRedisConstructor).toHaveBeenCalledWith({
      url: 'https://redis.example.com',
      token: 'test-token',
    })
  })

  it('returns null when KV_REST_API_URL is missing', async () => {
    delete process.env.KV_REST_API_URL
    process.env.KV_REST_API_TOKEN = 'test-token'
    vi.resetModules()
    const { redis } = (await import('./index')) as { redis: unknown }
    expect(redis).toBeNull()
    expect(mockRedisConstructor).not.toHaveBeenCalled()
  })

  it('returns null when KV_REST_API_TOKEN is missing', async () => {
    process.env.KV_REST_API_URL = 'https://redis.example.com'
    delete process.env.KV_REST_API_TOKEN
    vi.resetModules()
    const { redis } = (await import('./index')) as { redis: unknown }
    expect(redis).toBeNull()
    expect(mockRedisConstructor).not.toHaveBeenCalled()
  })

  it('returns null when both env vars are missing', async () => {
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
    vi.resetModules()
    const { redis } = (await import('./index')) as { redis: unknown }
    expect(redis).toBeNull()
  })
})

export {}

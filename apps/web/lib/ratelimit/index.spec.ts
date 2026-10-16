/**
 * @vitest-environment node
 */
const mockSlidingWindow = vi.fn().mockReturnValue('sliding-window-limiter')
const mockRatelimitConstructor = vi.fn()

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    function (...args: unknown[]) {
      mockRatelimitConstructor(...args)
      return { _isMockRatelimit: true }
    },
    { slidingWindow: mockSlidingWindow },
  ),
}))

describe('ratelimit', () => {
  afterEach(() => {
    vi.resetModules()
    mockRatelimitConstructor.mockClear()
    mockSlidingWindow.mockClear()
  })

  it('creates Ratelimit instance when redis is available', async () => {
    const mockRedis = { _isMockRedis: true }
    vi.doMock('../redis', () => ({ redis: mockRedis }))
    vi.resetModules()
    vi.doMock('../redis', () => ({ redis: mockRedis }))
    const { ratelimit } = (await import('./index')) as { ratelimit: unknown }
    expect(ratelimit).not.toBeNull()
    expect(mockRatelimitConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ redis: mockRedis }),
    )
    expect(mockSlidingWindow).toHaveBeenCalledWith(10, '1m')
  })

  it('returns null when redis is null', async () => {
    vi.resetModules()
    vi.doMock('../redis', () => ({ redis: null }))
    const { ratelimit } = (await import('./index')) as { ratelimit: unknown }
    expect(ratelimit).toBeNull()
    expect(mockRatelimitConstructor).not.toHaveBeenCalled()
  })
})

export {}

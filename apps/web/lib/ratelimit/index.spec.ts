/**
 * @jest-environment node
 */
const mockSlidingWindow = jest.fn().mockReturnValue('sliding-window-limiter')
const mockRatelimitConstructor = jest.fn()

jest.mock('@upstash/ratelimit', () => ({
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
    jest.resetModules()
    mockRatelimitConstructor.mockClear()
    mockSlidingWindow.mockClear()
  })

  it('creates Ratelimit instance when redis is available', () => {
    const mockRedis = { _isMockRedis: true }
    jest.doMock('../redis', () => ({ redis: mockRedis }))
    jest.resetModules()
    jest.doMock('../redis', () => ({ redis: mockRedis }))
    const { ratelimit } = require('./index') as { ratelimit: unknown }
    expect(ratelimit).not.toBeNull()
    expect(mockRatelimitConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ redis: mockRedis }),
    )
    expect(mockSlidingWindow).toHaveBeenCalledWith(10, '1m')
  })

  it('returns null when redis is null', () => {
    jest.resetModules()
    jest.doMock('../redis', () => ({ redis: null }))
    const { ratelimit } = require('./index') as { ratelimit: unknown }
    expect(ratelimit).toBeNull()
    expect(mockRatelimitConstructor).not.toHaveBeenCalled()
  })
})

export {}

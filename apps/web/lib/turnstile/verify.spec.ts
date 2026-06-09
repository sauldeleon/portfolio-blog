/**
 * @jest-environment node
 */
const mockFetch = jest.fn()
global.fetch = mockFetch

const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
  mockFetch.mockReset()
})

afterAll(() => {
  process.env = originalEnv
})

async function getVerify() {
  const { verifyTurnstile } = await import('./verify')
  return verifyTurnstile
}

describe('verifyTurnstile', () => {
  it('returns true when TURNSTILE_SECRET_KEY is not set', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    const verify = await getVerify()
    const result = await verify('any-token')
    expect(result).toBe(true)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns true when NODE_ENV is not production even if secret is set', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NODE_ENV = 'development'
    const verify = await getVerify()
    const result = await verify('any-token')
    expect(result).toBe(true)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns true when cloudflare responds success=true', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NODE_ENV = 'production'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })
    const verify = await getVerify()
    const result = await verify('valid-token')
    expect(result).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('returns false when cloudflare responds success=false', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NODE_ENV = 'production'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false }),
    })
    const verify = await getVerify()
    const result = await verify('bad-token')
    expect(result).toBe(false)
  })

  it('returns false when fetch response is not ok', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NODE_ENV = 'production'
    mockFetch.mockResolvedValueOnce({ ok: false })
    const verify = await getVerify()
    const result = await verify('bad-token')
    expect(result).toBe(false)
  })
})

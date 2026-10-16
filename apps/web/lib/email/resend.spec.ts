/**
 * @vitest-environment node
 */

describe('resend', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    vi.resetModules()
  })

  it('exports null when RESEND_API_KEY is not set', async () => {
    const env = { ...originalEnv }
    delete env.RESEND_API_KEY
    process.env = env
    vi.resetModules()
    const { resend } = (await import('./resend')) as typeof import('./resend')
    expect(resend).toBeNull()
  })

  it('exports a Resend instance when RESEND_API_KEY is set', async () => {
    process.env = { ...originalEnv, RESEND_API_KEY: 'test-api-key' }
    vi.resetModules()
    const { resend } = (await import('./resend')) as typeof import('./resend')
    expect(resend).not.toBeNull()
    expect(resend).toBeDefined()
  })
})

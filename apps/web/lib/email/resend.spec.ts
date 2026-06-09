/**
 * @jest-environment node
 */

describe('resend', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  it('exports null when RESEND_API_KEY is not set', () => {
    const env = { ...originalEnv }
    delete env.RESEND_API_KEY
    process.env = env
    jest.resetModules()
    const { resend } = require('./resend') as typeof import('./resend')
    expect(resend).toBeNull()
  })

  it('exports a Resend instance when RESEND_API_KEY is set', () => {
    process.env = { ...originalEnv, RESEND_API_KEY: 'test-api-key' }
    jest.resetModules()
    const { resend } = require('./resend') as typeof import('./resend')
    expect(resend).not.toBeNull()
    expect(resend).toBeDefined()
  })
})

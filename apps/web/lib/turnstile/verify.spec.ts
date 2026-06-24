/**
 * @jest-environment node
 */
import axios from 'axios'

import { verifyTurnstile } from './verify'

jest.mock('axios', () => ({ post: jest.fn() }))

const mockAxiosPost = jest.mocked(axios.post)

const originalEnv = process.env

beforeEach(() => {
  process.env = { ...originalEnv }
  mockAxiosPost.mockReset()
})

afterAll(() => {
  process.env = originalEnv
})

describe('verifyTurnstile', () => {
  it('returns true when TURNSTILE_SECRET_KEY is not set', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    expect(await verifyTurnstile('any-token')).toBe(true)
    expect(mockAxiosPost).not.toHaveBeenCalled()
  })

  it('returns true when NODE_ENV is not production even if secret is set', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NODE_ENV = 'development'
    expect(await verifyTurnstile('any-token')).toBe(true)
    expect(mockAxiosPost).not.toHaveBeenCalled()
  })

  it('returns true when cloudflare responds success=true', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NODE_ENV = 'production'
    mockAxiosPost.mockResolvedValueOnce({ data: { success: true } })
    expect(await verifyTurnstile('valid-token')).toBe(true)
    expect(mockAxiosPost).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.any(URLSearchParams),
      expect.objectContaining({ headers: expect.any(Object) }),
    )
  })

  it('returns false when cloudflare responds success=false', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NODE_ENV = 'production'
    mockAxiosPost.mockResolvedValueOnce({ data: { success: false } })
    expect(await verifyTurnstile('bad-token')).toBe(false)
  })

  it('returns false when the request fails', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NODE_ENV = 'production'
    mockAxiosPost.mockRejectedValueOnce(new Error('network'))
    expect(await verifyTurnstile('bad-token')).toBe(false)
  })
})

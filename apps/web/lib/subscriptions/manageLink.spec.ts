/**
 * @vitest-environment node
 */
import {
  MANAGE_LINK_TTL_MS,
  buildManageUrl,
  createManageLinkParams,
  verifyManageLink,
} from './manageLink'

const NOW = Date.UTC(2026, 10, 10)

function signed(now = NOW) {
  const params = createManageLinkParams('tok', now)
  if (!params) throw new Error('expected signed params')
  return params
}

beforeEach(() => {
  vi.stubEnv('SUBSCRIPTION_LINK_SECRET', 'test-secret')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('createManageLinkParams', () => {
  it('signs the token with an expiry 30 days ahead', () => {
    const params = createManageLinkParams('tok', NOW)
    expect(params?.token).toBe('tok')
    expect(Number(params?.expires) * 1000).toBe(NOW + MANAGE_LINK_TTL_MS)
    expect(params?.signature).toMatch(/^[\w-]+$/)
  })

  it('fails loudly in the helper without a secret', () => {
    vi.stubEnv('SUBSCRIPTION_LINK_SECRET', '')
    expect(() => signed()).toThrow('expected signed params')
  })

  it('returns null without a secret', () => {
    vi.stubEnv('SUBSCRIPTION_LINK_SECRET', '')
    expect(createManageLinkParams('tok', NOW)).toBeNull()
  })
})

describe('buildManageUrl', () => {
  it('puts the token, expiry and signature in the query', () => {
    expect(
      buildManageUrl('https://sawl.dev', 'es', {
        token: 'a b',
        expires: '123',
        signature: 'sig',
      }),
    ).toBe(
      'https://sawl.dev/es/subscribe/manage?token=a+b&expires=123&signature=sig',
    )
  })
})

describe('verifyManageLink', () => {
  it('accepts a fresh link', () => {
    const params = signed()
    expect(verifyManageLink(params, NOW + 1000)).toBe('valid')
  })

  it('reports an expired link', () => {
    const params = signed()
    expect(verifyManageLink(params, NOW + MANAGE_LINK_TTL_MS + 1000)).toBe(
      'expired',
    )
  })

  it('rejects a tampered expiry', () => {
    const params = signed()
    expect(
      verifyManageLink(
        { ...params, expires: String(Number(params.expires) + 1) },
        NOW,
      ),
    ).toBe('invalid')
  })

  it('rejects a link for another token', () => {
    const params = signed()
    expect(verifyManageLink({ ...params, token: 'other' }, NOW)).toBe('invalid')
  })

  it('rejects a signature of a different length', () => {
    const params = signed()
    expect(verifyManageLink({ ...params, signature: 'short' }, NOW)).toBe(
      'invalid',
    )
  })

  it('rejects a non-numeric expiry', () => {
    expect(
      verifyManageLink({ token: 'tok', expires: 'soon', signature: 'x' }, NOW),
    ).toBe('invalid')
  })

  it('rejects missing params', () => {
    expect(verifyManageLink({ token: 'tok' }, NOW)).toBe('invalid')
  })

  it('rejects everything without a secret', () => {
    const params = signed()
    vi.stubEnv('SUBSCRIPTION_LINK_SECRET', '')
    expect(verifyManageLink(params, NOW)).toBe('invalid')
  })

  it('uses the current time by default', () => {
    const params = createManageLinkParams('tok')
    expect(params && verifyManageLink(params)).toBe('valid')
  })
})

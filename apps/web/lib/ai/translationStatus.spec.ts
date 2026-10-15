import {
  blocksTranslation,
  classifyAnthropicError,
  unavailable,
} from './translationStatus'

const apiError = (status: number, message = '') =>
  Object.assign(new Error(message), { status })

describe('classifyAnthropicError', () => {
  it.each([
    [apiError(401), 'invalid_key'],
    [apiError(403), 'invalid_key'],
    [
      apiError(400, 'Your credit balance is too low to access the API'),
      'no_credit',
    ],
    [
      apiError(400, 'This API key is not scoped to a workspace'),
      'workspace_required',
    ],
    [apiError(400, 'max_tokens too large'), 'failed'],
    [apiError(404), 'model_unavailable'],
    [apiError(429), 'rate_limited'],
    [apiError(529), 'unavailable'],
    [apiError(500), 'unavailable'],
    [new Error('fetch failed'), 'unavailable'],
    [null, 'unavailable'],
    [{ status: 418 }, 'failed'],
  ])('classifies %p as %s', (err, reason) => {
    expect(classifyAnthropicError(err).reason).toBe(reason)
  })

  it('explains each reason', () => {
    expect(unavailable('no_credit')).toEqual({
      available: false,
      reason: 'no_credit',
      message: 'The Anthropic account has run out of credit.',
    })
  })
})

describe('blocksTranslation', () => {
  it('only lets transient failures retry straight away', () => {
    expect(blocksTranslation('no_credit')).toBe(true)
    expect(blocksTranslation('unavailable')).toBe(true)
    expect(blocksTranslation('rate_limited')).toBe(false)
    expect(blocksTranslation('failed')).toBe(false)
  })
})

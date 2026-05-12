/**
 * @jest-environment node
 */
jest.mock('./lib/auth/config', () => ({
  auth: (fn: unknown) => fn,
}))

describe('middleware', () => {
  it('re-exports default handler and config from proxy', () => {
     
    const middleware = require('./middleware')
    expect(middleware.default).toBeDefined()
    expect(middleware.config).toBeDefined()
    expect(Array.isArray(middleware.config.matcher)).toBe(true)
  })
})

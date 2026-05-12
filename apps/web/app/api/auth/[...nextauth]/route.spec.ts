/**
 * @jest-environment node
 */
jest.mock('next-auth', () => ({
  __esModule: true,
  default: () => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
}))

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('bcryptjs')

const { GET, POST } = require('./route') as typeof import('./route')

describe('auth [...nextauth] route', () => {
  it('exports GET handler', () => {
    expect(GET).toBeDefined()
  })

  it('exports POST handler', () => {
    expect(POST).toBeDefined()
  })
})

export {}

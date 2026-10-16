/**
 * @vitest-environment node
 */
vi.mock('next-auth', () => ({
  __esModule: true,
  default: () => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}))

vi.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: vi.fn(),
}))

vi.mock('bcryptjs')

const { GET, POST } = (await import('./route')) as typeof import('./route')

describe('auth [...nextauth] route', () => {
  it('exports GET handler', () => {
    expect(GET).toBeDefined()
  })

  it('exports POST handler', () => {
    expect(POST).toBeDefined()
  })
})

export {}

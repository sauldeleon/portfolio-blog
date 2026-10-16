const mockPool = vi.fn(function () {
  return {}
})
const mockDrizzle = vi.fn(function () {
  return { _mock: true }
})

vi.mock('@neondatabase/serverless', () => ({ Pool: mockPool }))
vi.mock('drizzle-orm/neon-serverless', () => ({ drizzle: mockDrizzle }))
vi.mock('./schema', () => ({}))

describe('db', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('does not call Pool() at module load time', async () => {
    await import('./index')
    expect(mockPool).not.toHaveBeenCalled()
  })

  it('getDb() initialises drizzle lazily on first call', async () => {
    const { getDb } = (await import('./index')) as typeof import('./index')
    getDb()
    expect(mockPool).toHaveBeenCalledTimes(1)
    expect(mockDrizzle).toHaveBeenCalledTimes(1)
  })

  it('getDb() returns same instance on subsequent calls', async () => {
    const { getDb } = (await import('./index')) as typeof import('./index')
    const a = getDb()
    const b = getDb()
    expect(a).toBe(b)
    expect(mockPool).toHaveBeenCalledTimes(1)
  })

  it('db proxy forwards property access to the drizzle instance', async () => {
    const sentinel = vi.fn()
    mockDrizzle.mockReturnValueOnce({ select: sentinel } as never)
    const { db } = (await import('./index')) as typeof import('./index')
    expect(db.select).toBe(sentinel)
  })
})

export {}

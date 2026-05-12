const mockNeon = jest.fn(() => jest.fn())
const mockDrizzle = jest.fn(() => ({ _mock: true }))

jest.mock('@neondatabase/serverless', () => ({ neon: mockNeon }))
jest.mock('drizzle-orm/neon-http', () => ({ drizzle: mockDrizzle }))
jest.mock('./schema', () => ({}))

describe('db', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('does not call neon() at module load time', () => {
    require('./index')
    expect(mockNeon).not.toHaveBeenCalled()
  })

  it('getDb() initialises drizzle lazily on first call', () => {
    const { getDb } = require('./index') as typeof import('./index')
    getDb()
    expect(mockNeon).toHaveBeenCalledTimes(1)
    expect(mockDrizzle).toHaveBeenCalledTimes(1)
  })

  it('getDb() returns same instance on subsequent calls', () => {
    const { getDb } = require('./index') as typeof import('./index')
    const a = getDb()
    const b = getDb()
    expect(a).toBe(b)
    expect(mockNeon).toHaveBeenCalledTimes(1)
  })

  it('db proxy forwards property access to the drizzle instance', () => {
    const sentinel = jest.fn()
    mockDrizzle.mockReturnValueOnce({ select: sentinel } as never)
    const { db } = require('./index') as typeof import('./index')
    expect(db.select).toBe(sentinel)
  })
})

export {}

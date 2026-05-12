jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(() => jest.fn()),
}))

jest.mock('drizzle-orm/neon-http', () => ({
  drizzle: jest.fn(() => ({ _mock: true })),
}))

jest.mock('./schema', () => ({}))

const { db } = require('./index') as typeof import('./index')

describe('db', () => {
  it('exports the drizzle db client', () => {
    expect(db).toBeDefined()
  })
})

export {}

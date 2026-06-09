import { db } from '../index'
import {
  confirmSubscription,
  createSubscription,
  getActiveSubscribers,
  getSubscriptionByEmail,
  getSubscriptionByToken,
  unsubscribeByToken,
} from './subscriptions'

jest.mock('../index', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock('ulid', () => ({ ulid: () => '01JWTEST000000000000000000' }))

const mockCrypto = { randomUUID: jest.fn(() => 'test-token-uuid') }
Object.defineProperty(global, 'crypto', { value: mockCrypto, writable: true })

const mockDb = db as unknown as {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
}

function makeChain(resolved: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['from', 'where', 'values', 'set', 'returning']
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain)
  }
  chain.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(resolved).then(resolve)
  chain.catch = jest.fn().mockReturnThis()
  chain.finally = jest.fn().mockReturnThis()
  return chain
}

const now = new Date('2024-01-01T00:00:00.000Z')

const mockRow = {
  id: '01JWTEST000000000000000000',
  email: 'test@example.com',
  name: 'Test User',
  status: 'pending',
  token: 'test-token-uuid',
  locale: 'en',
  createdAt: now,
  confirmedAt: null,
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getSubscriptionByEmail', () => {
  it('returns subscription when found', async () => {
    mockDb.select.mockReturnValue(makeChain([mockRow]))
    const result = await getSubscriptionByEmail('test@example.com')
    expect(result).toEqual({
      id: mockRow.id,
      email: mockRow.email,
      name: mockRow.name,
      status: 'pending',
      token: mockRow.token,
      locale: 'en',
      createdAt: now,
      confirmedAt: null,
    })
  })

  it('returns null when not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getSubscriptionByEmail('missing@example.com')
    expect(result).toBeNull()
  })
})

describe('getSubscriptionByToken', () => {
  it('returns subscription when found', async () => {
    mockDb.select.mockReturnValue(makeChain([mockRow]))
    const result = await getSubscriptionByToken('test-token-uuid')
    expect(result).not.toBeNull()
    expect(result?.token).toBe('test-token-uuid')
  })

  it('returns null when not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getSubscriptionByToken('missing-token')
    expect(result).toBeNull()
  })
})

describe('createSubscription', () => {
  it('inserts and returns subscription', async () => {
    mockDb.insert.mockReturnValue(makeChain([mockRow]))
    const result = await createSubscription({
      email: 'test@example.com',
      name: 'Test User',
      locale: 'en',
    })
    expect(result).toEqual({
      id: mockRow.id,
      email: mockRow.email,
      name: mockRow.name,
      status: 'pending',
      token: 'test-token-uuid',
      locale: 'en',
      createdAt: now,
      confirmedAt: null,
    })
  })
})

describe('confirmSubscription', () => {
  it('returns updated subscription when found', async () => {
    const confirmedRow = { ...mockRow, status: 'active', confirmedAt: now }
    mockDb.update.mockReturnValue(makeChain([confirmedRow]))
    const result = await confirmSubscription('test-token-uuid')
    expect(result).not.toBeNull()
    expect(result?.status).toBe('active')
    expect(result?.confirmedAt).toBe(now)
  })

  it('returns null when token not found', async () => {
    mockDb.update.mockReturnValue(makeChain([]))
    const result = await confirmSubscription('missing-token')
    expect(result).toBeNull()
  })
})

describe('getActiveSubscribers', () => {
  it('returns all active subscribers', async () => {
    const activeRow = { ...mockRow, status: 'active', confirmedAt: now }
    mockDb.select.mockReturnValue(makeChain([activeRow]))
    const result = await getActiveSubscribers()
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('active')
  })

  it('returns empty array when no active subscribers', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getActiveSubscribers()
    expect(result).toEqual([])
  })
})

describe('unsubscribeByToken', () => {
  it('returns updated subscription when found', async () => {
    const unsubscribedRow = { ...mockRow, status: 'unsubscribed' }
    mockDb.update.mockReturnValue(makeChain([unsubscribedRow]))
    const result = await unsubscribeByToken('test-token-uuid')
    expect(result).not.toBeNull()
    expect(result?.status).toBe('unsubscribed')
  })

  it('returns null when token not found', async () => {
    mockDb.update.mockReturnValue(makeChain([]))
    const result = await unsubscribeByToken('missing-token')
    expect(result).toBeNull()
  })
})

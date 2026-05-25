import { db } from '../index'
import {
  countAdmins,
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  listUsers,
  updateUser,
} from './users'

jest.mock('../index', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('ulid', () => ({ ulid: () => '01JWTEST000000000000000000' }))

const mockDb = db as unknown as {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
}

function makeChain(resolved: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['from', 'where', 'orderBy', 'values', 'set', 'returning']
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

const mockUserRow = {
  id: 'user-1',
  email: 'admin@example.com',
  passwordHash: '$2b$10$hashedpassword',
  role: 'admin',
  name: 'Admin User',
  createdAt: now,
  updatedAt: now,
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getUserByEmail', () => {
  it('returns user with hash when found', async () => {
    mockDb.select.mockReturnValue(makeChain([mockUserRow]))
    const result = await getUserByEmail('admin@example.com')
    expect(result).toEqual({
      id: 'user-1',
      email: 'admin@example.com',
      passwordHash: '$2b$10$hashedpassword',
      role: 'admin',
      name: 'Admin User',
      createdAt: now,
      updatedAt: now,
    })
  })

  it('returns null when not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getUserByEmail('nobody@example.com')
    expect(result).toBeNull()
  })
})

describe('getUserById', () => {
  it('returns user record when found', async () => {
    mockDb.select.mockReturnValue(makeChain([mockUserRow]))
    const result = await getUserById('user-1')
    expect(result).toEqual({
      id: 'user-1',
      email: 'admin@example.com',
      role: 'admin',
      name: 'Admin User',
      createdAt: now,
      updatedAt: now,
    })
  })

  it('returns null when not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getUserById('missing')
    expect(result).toBeNull()
  })
})

describe('listUsers', () => {
  it('returns all users ordered by createdAt', async () => {
    const editorRow = {
      ...mockUserRow,
      id: 'user-2',
      email: 'editor@example.com',
      role: 'editor',
    }
    mockDb.select.mockReturnValue(makeChain([mockUserRow, editorRow]))
    const result = await listUsers()
    expect(result).toHaveLength(2)
    expect(result[0].email).toBe('admin@example.com')
    expect(result[1].email).toBe('editor@example.com')
  })

  it('returns empty array when no users', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await listUsers()
    expect(result).toEqual([])
  })
})

describe('createUser', () => {
  it('creates and returns new user with ULID', async () => {
    mockDb.insert.mockReturnValue(makeChain([mockUserRow]))
    const result = await createUser({
      email: 'admin@example.com',
      passwordHash: '$2b$10$hashedpassword',
      role: 'admin',
      name: 'Admin User',
    })
    expect(result).toEqual({
      id: 'user-1',
      email: 'admin@example.com',
      role: 'admin',
      name: 'Admin User',
      createdAt: now,
      updatedAt: now,
    })
  })
})

describe('updateUser', () => {
  it('returns updated user when found', async () => {
    const updatedRow = { ...mockUserRow, role: 'editor', updatedAt: new Date() }
    mockDb.update.mockReturnValue(makeChain([updatedRow]))
    const result = await updateUser('user-1', { role: 'editor' })
    expect(result?.role).toBe('editor')
  })

  it('returns null when user not found', async () => {
    mockDb.update.mockReturnValue(makeChain([]))
    const result = await updateUser('missing', { role: 'editor' })
    expect(result).toBeNull()
  })
})

describe('deleteUser', () => {
  it('deletes user by id', async () => {
    mockDb.delete.mockReturnValue(makeChain(undefined))
    await expect(deleteUser('user-1')).resolves.toBeUndefined()
  })
})

describe('countAdmins', () => {
  it('returns count of admin users', async () => {
    mockDb.select.mockReturnValue(makeChain([{ count: 2 }]))
    const result = await countAdmins()
    expect(result).toBe(2)
  })

  it('returns 0 when no admins', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await countAdmins()
    expect(result).toBe(0)
  })
})

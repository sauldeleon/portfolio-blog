import bcrypt from 'bcryptjs'

import { authorizeCredentials } from './config'

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
  default: jest.fn((opts: unknown) => opts),
}))

jest.mock('bcryptjs')

const mockCompare = bcrypt.compare as jest.Mock

describe('authorizeCredentials', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD_HASH: '$2b$10$testhash',
    }
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns null when username is missing', async () => {
    const result = await authorizeCredentials({ password: 'pass' })
    expect(result).toBeNull()
  })

  it('returns null when password is missing', async () => {
    const result = await authorizeCredentials({ username: 'admin' })
    expect(result).toBeNull()
  })

  it('returns null when username does not match ADMIN_USERNAME', async () => {
    const result = await authorizeCredentials({
      username: 'wrong',
      password: 'pass',
    })
    expect(result).toBeNull()
  })

  it('returns null when ADMIN_PASSWORD_HASH is not set', async () => {
    delete process.env.ADMIN_PASSWORD_HASH
    const result = await authorizeCredentials({
      username: 'admin',
      password: 'pass',
    })
    expect(result).toBeNull()
  })

  it('returns null when bcrypt compare fails', async () => {
    mockCompare.mockResolvedValue(false)
    const result = await authorizeCredentials({
      username: 'admin',
      password: 'wrong',
    })
    expect(result).toBeNull()
  })

  it('returns user object when credentials are valid', async () => {
    mockCompare.mockResolvedValue(true)
    const result = await authorizeCredentials({
      username: 'admin',
      password: 'correct',
    })
    expect(result).toEqual({ id: 'admin', name: 'admin' })
  })
})

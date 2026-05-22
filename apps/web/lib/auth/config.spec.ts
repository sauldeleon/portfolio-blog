/**
 * @jest-environment node
 */
import bcrypt from 'bcryptjs'

import { getUserByEmail } from '@web/lib/db/queries/users'

import { authorizeCredentials, resolveAuthSecret } from './config'

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
jest.mock('@web/lib/db/queries/users')

const mockCompare = bcrypt.compare as jest.Mock

const mockGetUserByEmail = getUserByEmail as jest.Mock

describe('authorizeCredentials', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD_HASH: 'JDJiJDEwJHRlc3RoYXNo', // base64('$2b$10$testhash')
    }
    jest.clearAllMocks()
    mockGetUserByEmail.mockResolvedValue(null)
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns null when email is missing', async () => {
    const result = await authorizeCredentials({ password: 'pass' })
    expect(result).toBeNull()
    expect(mockCompare).not.toHaveBeenCalled()
  })

  it('returns null when password is missing', async () => {
    const result = await authorizeCredentials({ email: 'admin@example.com' })
    expect(result).toBeNull()
    expect(mockCompare).not.toHaveBeenCalled()
  })

  describe('DB user auth', () => {
    const dbUser = {
      id: 'user-1',
      email: 'admin@example.com',
      passwordHash: '$2b$10$dbhash',
      role: 'admin' as const,
      name: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('returns user with role from DB when credentials valid', async () => {
      mockGetUserByEmail.mockResolvedValue(dbUser)
      mockCompare.mockResolvedValue(true)
      const result = await authorizeCredentials({
        email: 'admin@example.com',
        password: 'correct',
      })
      expect(result).toEqual({ id: 'user-1', name: 'Admin', role: 'admin' })
    })

    it('returns null when DB user password invalid', async () => {
      mockGetUserByEmail.mockResolvedValue(dbUser)
      mockCompare.mockResolvedValue(false)
      const result = await authorizeCredentials({
        email: 'admin@example.com',
        password: 'wrong',
      })
      expect(result).toBeNull()
    })
  })

  describe('env-var fallback auth', () => {
    it('returns null when email does not match ADMIN_USERNAME', async () => {
      mockCompare.mockResolvedValue(false)
      const result = await authorizeCredentials({
        email: 'wrong@example.com',
        password: 'pass',
      })
      expect(result).toBeNull()
      // bcrypt must always run to prevent timing-based email enumeration
      expect(mockCompare).toHaveBeenCalledTimes(1)
    })

    it('returns null when ADMIN_PASSWORD_HASH is not set', async () => {
      delete process.env.ADMIN_PASSWORD_HASH
      const result = await authorizeCredentials({
        email: 'admin',
        password: 'pass',
      })
      expect(result).toBeNull()
      expect(mockCompare).not.toHaveBeenCalled()
    })

    it('returns null when bcrypt compare fails', async () => {
      mockCompare.mockResolvedValue(false)
      const result = await authorizeCredentials({
        email: 'admin',
        password: 'wrong',
      })
      expect(result).toBeNull()
    })

    it('returns admin user with role admin when env credentials are valid', async () => {
      mockCompare.mockResolvedValue(true)
      const result = await authorizeCredentials({
        email: 'admin',
        password: 'correct',
      })
      expect(result).toEqual({ id: 'admin', name: 'admin', role: 'admin' })
    })
  })
})

describe('authConfig.callbacks', () => {
  // Import authConfig after mocks are set up
  let callbacks: Awaited<
    ReturnType<typeof import('./config')>
  >['authConfig']['callbacks']

  beforeEach(async () => {
    const mod = await import('./config')
    callbacks = mod.authConfig.callbacks
  })

  describe('jwt', () => {
    it('adds role to token when user is present', () => {
      const token = {}
      const user = { id: 'u1', name: 'admin', role: 'admin' as const }
       
      const result = (callbacks as any).jwt({ token, user })
      expect(result).toMatchObject({ role: 'admin' })
    })

    it('returns token unchanged when user is absent', () => {
      const token = { role: 'editor' as const }
       
      const result = (callbacks as any).jwt({ token })
      expect(result).toEqual({ role: 'editor' })
    })
  })

  describe('session', () => {
    it('sets role on session.user from token', () => {
      const session = { user: { id: 'u1', name: 'admin', role: undefined } }
      const token = { role: 'admin' as const }
       
      const result = (callbacks as any).session({ session, token })
      expect(result.user.role).toBe('admin')
    })

    it('leaves session unchanged when token has no role', () => {
      const session = { user: { id: 'u1', name: 'admin', role: undefined } }
      const token = {}
       
      const result = (callbacks as any).session({ session, token })
      expect(result.user.role).toBeUndefined()
    })
  })
})

describe('resolveAuthSecret', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses AUTH_SECRET when available', () => {
    process.env.AUTH_SECRET = 'auth-secret'
    process.env.NEXTAUTH_SECRET = 'nextauth-secret'

    expect(resolveAuthSecret()).toBe('auth-secret')
  })

  it('falls back to NEXTAUTH_SECRET', () => {
    delete process.env.AUTH_SECRET
    process.env.NEXTAUTH_SECRET = 'nextauth-secret'

    expect(resolveAuthSecret()).toBe('nextauth-secret')
  })
})

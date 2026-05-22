/**
 * @jest-environment node
 */
import bcrypt from 'bcryptjs'

import { auth } from '@web/lib/auth/config'
import {
  createUser,
  getUserByEmail,
  listUsers,
} from '@web/lib/db/queries/users'

import { GET, POST } from './route'

jest.mock('@web/lib/auth/config', () => ({ auth: jest.fn() }))
jest.mock('@web/lib/db/queries/users')
jest.mock('bcryptjs')
jest.mock('@web/lib/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}))

const mockAuth = auth as jest.Mock
const mockListUsers = listUsers as jest.Mock
const mockGetUserByEmail = getUserByEmail as jest.Mock
const mockCreateUser = createUser as jest.Mock
const mockBcryptHash = bcrypt.hash as jest.Mock

const adminSession = { user: { id: 'a', name: 'admin', role: 'admin' } }
const editorSession = { user: { id: 'b', name: 'editor', role: 'editor' } }

const now = new Date('2024-01-01T00:00:00.000Z')
const mockUser = {
  id: 'user-1',
  email: 'admin@example.com',
  role: 'admin',
  name: 'Admin',
  createdAt: now,
  updatedAt: now,
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/users', () => {
  it('returns 403 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('returns 403 when user is not admin', async () => {
    mockAuth.mockResolvedValue(editorSession)
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('returns users list for admin', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockListUsers.mockResolvedValue([mockUser])
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(1)
    expect(json.data[0].email).toBe('admin@example.com')
  })
})

describe('POST /api/users', () => {
  function makeRequest(body: unknown) {
    return new Request('http://localhost/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('returns 403 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST(
      makeRequest({
        email: 'u@example.com',
        password: 'password1',
        role: 'editor',
      }),
    )
    expect(res.status).toBe(403)
  })

  it('returns 403 when user is not admin', async () => {
    mockAuth.mockResolvedValue(editorSession)
    const res = await POST(
      makeRequest({
        email: 'u@example.com',
        password: 'password1',
        role: 'editor',
      }),
    )
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid JSON', async () => {
    mockAuth.mockResolvedValue(adminSession)
    const req = new Request('http://localhost/api/users', {
      method: 'POST',
      body: 'not json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid body schema', async () => {
    mockAuth.mockResolvedValue(adminSession)
    const res = await POST(
      makeRequest({ email: 'notanemail', password: 'short' }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 409 when email already taken', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserByEmail.mockResolvedValue(mockUser)
    const res = await POST(
      makeRequest({
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin',
        role: 'editor',
      }),
    )
    expect(res.status).toBe(409)
  })

  it('creates user and returns 201', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserByEmail.mockResolvedValue(null)
    mockBcryptHash.mockResolvedValue('$2b$10$hashed')
    mockCreateUser.mockResolvedValue(mockUser)
    const res = await POST(
      makeRequest({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'editor',
      }),
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.email).toBe('admin@example.com')
  })

  it('returns 500 when createUser throws', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserByEmail.mockResolvedValue(null)
    mockBcryptHash.mockResolvedValue('$2b$10$hashed')
    mockCreateUser.mockRejectedValue(new Error('DB error'))
    const res = await POST(
      makeRequest({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'editor',
      }),
    )
    expect(res.status).toBe(500)
  })
})

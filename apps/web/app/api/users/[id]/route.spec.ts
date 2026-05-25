/**
 * @jest-environment node
 */
import bcrypt from 'bcryptjs'

import { auth } from '@web/lib/auth/config'
import {
  countAdmins,
  deleteUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from '@web/lib/db/queries/users'

import { DELETE, PATCH } from './route'

jest.mock('@web/lib/auth/config', () => ({ auth: jest.fn() }))
jest.mock('@web/lib/db/queries/users')
jest.mock('bcryptjs')
jest.mock('@web/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}))

const mockAuth = auth as jest.Mock
const mockGetUserById = getUserById as jest.Mock
const mockGetUserByEmail = getUserByEmail as jest.Mock
const mockUpdateUser = updateUser as jest.Mock
const mockDeleteUser = deleteUser as jest.Mock
const mockCountAdmins = countAdmins as jest.Mock
const mockBcryptHash = bcrypt.hash as jest.Mock

const adminSession = { user: { id: 'a', name: 'admin', role: 'admin' } }
const editorSession = { user: { id: 'b', name: 'editor', role: 'editor' } }
const now = new Date('2024-01-01T00:00:00.000Z')

const adminUser = {
  id: 'user-1',
  username: 'admin',
  role: 'admin',
  name: 'Admin',
  createdAt: now,
  updatedAt: now,
}

const editorUser = {
  id: 'user-2',
  username: 'editor',
  role: 'editor',
  name: null,
  createdAt: now,
  updatedAt: now,
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/users/user-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('PATCH /api/users/[id]', () => {
  it('returns 403 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PATCH(
      makeRequest({ role: 'editor' }),
      makeParams('user-1'),
    )
    expect(res.status).toBe(403)
  })

  it('returns 403 when user is not admin', async () => {
    mockAuth.mockResolvedValue(editorSession)
    const res = await PATCH(
      makeRequest({ role: 'editor' }),
      makeParams('user-1'),
    )
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid JSON', async () => {
    mockAuth.mockResolvedValue(adminSession)
    const req = new Request('http://localhost/api/users/user-1', {
      method: 'PATCH',
      body: 'not json',
    })
    const res = await PATCH(req, makeParams('user-1'))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid body', async () => {
    mockAuth.mockResolvedValue(adminSession)
    const res = await PATCH(
      makeRequest({ password: 'short' }),
      makeParams('user-1'),
    )
    expect(res.status).toBe(400)
  })

  it('returns 422 when demoting last admin', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserById.mockResolvedValue(adminUser)
    mockCountAdmins.mockResolvedValue(1)
    const res = await PATCH(
      makeRequest({ role: 'editor' }),
      makeParams('user-1'),
    )
    expect(res.status).toBe(422)
  })

  it('returns 404 when user not found after update', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserById.mockResolvedValue(editorUser)
    mockUpdateUser.mockResolvedValue(null)
    const res = await PATCH(
      makeRequest({ role: 'admin' }),
      makeParams('user-2'),
    )
    expect(res.status).toBe(404)
  })

  it('updates role successfully', async () => {
    mockAuth.mockResolvedValue(adminSession)
    const updated = { ...editorUser, role: 'admin' }
    mockUpdateUser.mockResolvedValue(updated)
    const res = await PATCH(
      makeRequest({ role: 'admin' }),
      makeParams('user-2'),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.role).toBe('admin')
  })

  it('hashes password when updating password', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockBcryptHash.mockResolvedValue('$2b$10$newhash')
    mockUpdateUser.mockResolvedValue(editorUser)
    const res = await PATCH(
      makeRequest({ password: 'newpassword123' }),
      makeParams('user-2'),
    )
    expect(res.status).toBe(200)
    expect(mockBcryptHash).toHaveBeenCalledWith('newpassword123', 10)
  })

  it('allows demoting admin when multiple admins exist', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserById.mockResolvedValue(adminUser)
    mockCountAdmins.mockResolvedValue(2)
    mockUpdateUser.mockResolvedValue({ ...adminUser, role: 'editor' })
    const res = await PATCH(
      makeRequest({ role: 'editor' }),
      makeParams('user-1'),
    )
    expect(res.status).toBe(200)
  })

  it('returns 400 when name is null', async () => {
    mockAuth.mockResolvedValue(adminSession)
    const res = await PATCH(makeRequest({ name: null }), makeParams('user-2'))
    expect(res.status).toBe(400)
  })

  it('updates name successfully', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockUpdateUser.mockResolvedValue({ ...editorUser, name: 'New Name' })
    const res = await PATCH(
      makeRequest({ name: 'New Name' }),
      makeParams('user-2'),
    )
    expect(res.status).toBe(200)
    expect(mockUpdateUser).toHaveBeenCalledWith(
      'user-2',
      expect.objectContaining({ name: 'New Name' }),
    )
  })

  it('changes non-admin user role without checking admin count', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserById.mockResolvedValue(editorUser)
    mockUpdateUser.mockResolvedValue({ ...editorUser, role: 'user' })
    const res = await PATCH(makeRequest({ role: 'user' }), makeParams('user-2'))
    expect(res.status).toBe(200)
    expect(mockGetUserById).toHaveBeenCalledWith('user-2')
    expect(mockCountAdmins).not.toHaveBeenCalled()
  })

  it('updates email successfully', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserByEmail.mockResolvedValue(null)
    mockUpdateUser.mockResolvedValue({ ...adminUser, email: 'new@example.com' })
    const res = await PATCH(
      makeRequest({ email: 'new@example.com' }),
      makeParams('user-1'),
    )
    expect(res.status).toBe(200)
    expect(mockUpdateUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ email: 'new@example.com' }),
    )
  })

  it('returns 409 when email already taken by another user', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserByEmail.mockResolvedValue({ ...editorUser, id: 'user-99' })
    const res = await PATCH(
      makeRequest({ email: 'taken@example.com' }),
      makeParams('user-1'),
    )
    expect(res.status).toBe(409)
  })

  it('allows updating email to current users own email', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserByEmail.mockResolvedValue(adminUser)
    mockUpdateUser.mockResolvedValue(adminUser)
    const res = await PATCH(
      makeRequest({ email: 'admin@example.com' }),
      makeParams('user-1'),
    )
    expect(res.status).toBe(200)
  })

  it('returns 400 for invalid email', async () => {
    mockAuth.mockResolvedValue(adminSession)
    const res = await PATCH(
      makeRequest({ email: 'not-an-email' }),
      makeParams('user-1'),
    )
    expect(res.status).toBe(400)
  })

  it('returns 500 when updateUser throws', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockUpdateUser.mockRejectedValue(new Error('DB error'))
    const res = await PATCH(
      makeRequest({ role: 'editor' }),
      makeParams('user-2'),
    )
    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/users/[id]', () => {
  function makeDeleteRequest() {
    return new Request('http://localhost/api/users/user-1', {
      method: 'DELETE',
    })
  }

  it('returns 403 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await DELETE(makeDeleteRequest(), makeParams('user-1'))
    expect(res.status).toBe(403)
  })

  it('returns 403 when user is not admin', async () => {
    mockAuth.mockResolvedValue(editorSession)
    const res = await DELETE(makeDeleteRequest(), makeParams('user-1'))
    expect(res.status).toBe(403)
  })

  it('returns 404 when user not found', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserById.mockResolvedValue(null)
    const res = await DELETE(makeDeleteRequest(), makeParams('missing'))
    expect(res.status).toBe(404)
  })

  it('returns 422 when deleting last admin', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserById.mockResolvedValue(adminUser)
    mockCountAdmins.mockResolvedValue(1)
    const res = await DELETE(makeDeleteRequest(), makeParams('user-1'))
    expect(res.status).toBe(422)
  })

  it('deletes editor user successfully', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserById.mockResolvedValue(editorUser)
    mockDeleteUser.mockResolvedValue(undefined)
    const res = await DELETE(makeDeleteRequest(), makeParams('user-2'))
    expect(res.status).toBe(204)
  })

  it('deletes admin when multiple admins exist', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserById.mockResolvedValue(adminUser)
    mockCountAdmins.mockResolvedValue(2)
    mockDeleteUser.mockResolvedValue(undefined)
    const res = await DELETE(makeDeleteRequest(), makeParams('user-1'))
    expect(res.status).toBe(204)
  })

  it('returns 500 when deleteUser throws', async () => {
    mockAuth.mockResolvedValue(adminSession)
    mockGetUserById.mockResolvedValue(editorUser)
    mockDeleteUser.mockRejectedValue(new Error('DB error'))
    const res = await DELETE(makeDeleteRequest(), makeParams('user-2'))
    expect(res.status).toBe(500)
  })
})

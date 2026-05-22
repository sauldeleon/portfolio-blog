import { requireAdminRoleSession } from './requireAdminRoleSession'

const mockRequireAdminSession = jest.fn()
const mockRedirect = jest.fn()

jest.mock('./requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

describe('requireAdminRoleSession', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns session when user has admin role', async () => {
    const session = { user: { id: 'u1', name: 'admin', role: 'admin' } }
    mockRequireAdminSession.mockResolvedValue(session)

    await expect(requireAdminRoleSession()).resolves.toBe(session)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects to /admin/posts when user has editor role', async () => {
    const session = { user: { id: 'u2', name: 'editor', role: 'editor' } }
    mockRequireAdminSession.mockResolvedValue(session)

    await requireAdminRoleSession()
    expect(mockRedirect).toHaveBeenCalledWith('/admin/posts')
  })

  it('redirects to /admin/posts when user has user role', async () => {
    const session = { user: { id: 'u3', name: 'viewer', role: 'user' } }
    mockRequireAdminSession.mockResolvedValue(session)

    await requireAdminRoleSession()
    expect(mockRedirect).toHaveBeenCalledWith('/admin/posts')
  })
})

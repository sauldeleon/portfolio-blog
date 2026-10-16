import { requireAdminRoleSession } from './requireAdminRoleSession'

const mockRequireAdminSession = vi.fn()
const mockRedirect = vi.fn()

vi.mock('./requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

describe('requireAdminRoleSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

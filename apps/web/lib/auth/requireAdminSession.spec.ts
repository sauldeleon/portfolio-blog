const mockAuth = jest.fn()
const mockRedirect = jest.fn()

jest.mock('./config', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

describe('requireAdminSession', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the active session', async () => {
    const session = { user: { name: 'admin' } }
    mockAuth.mockResolvedValue(session)

    const { requireAdminSession } = require('./requireAdminSession')
    await expect(requireAdminSession()).resolves.toBe(session)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects to /admin/login when no session exists', async () => {
    mockAuth.mockResolvedValue(null)

    const { requireAdminSession } = require('./requireAdminSession')
    await requireAdminSession()
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })
})

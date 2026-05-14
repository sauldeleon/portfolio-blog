const mockSignOut = jest.fn()
const mockRedirect = jest.fn()

jest.mock('@web/lib/auth/config', () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

describe('logoutAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls signOut with redirect: false then redirects to /admin/login', async () => {
    mockSignOut.mockResolvedValue(undefined)
    const { logoutAction } = require('./logout')
    await logoutAction()
    expect(mockSignOut).toHaveBeenCalledWith({ redirect: false })
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })
})

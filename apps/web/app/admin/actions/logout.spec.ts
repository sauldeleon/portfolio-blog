const mockSignOut = jest.fn()

jest.mock('@web/lib/auth/config', () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

describe('logoutAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls signOut with redirect to /admin/login', async () => {
    mockSignOut.mockResolvedValue(undefined)
    const { logoutAction } = require('./logout')
    await logoutAction()
    expect(mockSignOut).toHaveBeenCalledWith({
      redirectTo: '/admin/login',
    })
  })
})

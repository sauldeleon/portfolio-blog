const mockSignOut = vi.fn()
const mockRedirect = vi.fn()

vi.mock('@web/lib/auth/config', () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

describe('logoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls signOut with redirect: false then redirects to /admin/login', async () => {
    mockSignOut.mockResolvedValue(undefined)
    const { logoutAction } = await import('./logout')
    await logoutAction()
    expect(mockSignOut).toHaveBeenCalledWith({ redirect: false })
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })
})

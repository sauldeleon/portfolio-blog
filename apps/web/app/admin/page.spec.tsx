const mockRedirect = vi.fn()
const mockRequireAdminSession = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

vi.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects authenticated users to /admin/posts', async () => {
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
    const { default: AdminPage } = await import('./page.next')
    await AdminPage()
    expect(mockRequireAdminSession).toHaveBeenCalledTimes(1)
    expect(mockRedirect).toHaveBeenCalledWith('/admin/posts')
  })

  it('does not redirect to /admin/posts when the admin session check redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)
    const { default: AdminPage } = await import('./page.next')

    await expect(AdminPage()).rejects.toBe(redirectError)
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})

export {}

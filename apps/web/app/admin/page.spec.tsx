const mockRedirect = jest.fn()
const mockRequireAdminSession = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects authenticated users to /admin/posts', async () => {
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
    const { default: AdminPage } = require('./page.next')
    await AdminPage()
    expect(mockRequireAdminSession).toHaveBeenCalledTimes(1)
    expect(mockRedirect).toHaveBeenCalledWith('/admin/posts')
  })

  it('does not redirect to /admin/posts when the admin session check redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)
    const { default: AdminPage } = require('./page.next')

    await expect(AdminPage()).rejects.toBe(redirectError)
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})

export {}

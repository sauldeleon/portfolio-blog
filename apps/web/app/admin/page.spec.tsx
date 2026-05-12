const mockRedirect = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

describe('AdminPage', () => {
  it('redirects to /admin/posts', () => {
    const { default: AdminPage } = require('./page.next')
    AdminPage()
    expect(mockRedirect).toHaveBeenCalledWith('/admin/posts')
  })
})

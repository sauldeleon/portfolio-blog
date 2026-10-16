import { render, screen } from '@testing-library/react'

import AdminUsersPage from './page.next'

const mockRequireAdminRoleSession = vi.fn()

vi.mock('@web/lib/auth/requireAdminRoleSession', () => ({
  requireAdminRoleSession: (...args: unknown[]) =>
    mockRequireAdminRoleSession(...args),
}))

vi.mock('@web/i18n/server', () => ({
  getServerTranslation: vi.fn().mockResolvedValue({
    t: (key: string) => key,
  }),
}))

vi.mock('@web/lib/db/queries/users', () => ({
  listUsers: vi.fn().mockResolvedValue([]),
}))

vi.mock('./components/UsersPageView', () => ({
  UsersPageView: vi.fn(({ title }: { title: string }) => (
    <div data-testid="users-page-view">{title}</div>
  )),
}))

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAdminRoleSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Admin', role: 'admin' },
    })
  })

  it('renders UsersPageView with users and title', async () => {
    const ui = await AdminUsersPage()
    render(ui)
    expect(screen.getByTestId('users-page-view')).toBeInTheDocument()
  })

  it('calls requireAdminRoleSession', async () => {
    await AdminUsersPage()
    expect(mockRequireAdminRoleSession).toHaveBeenCalledTimes(1)
  })

  it('throws when session check redirects (non-admin)', async () => {
    const err = new Error('NEXT_REDIRECT')
    mockRequireAdminRoleSession.mockRejectedValue(err)
    await expect(AdminUsersPage()).rejects.toBe(err)
  })
})

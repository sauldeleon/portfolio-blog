import { render, screen } from '@testing-library/react'

import AdminUsersPage from './page.next'

const mockRequireAdminRoleSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminRoleSession', () => ({
  requireAdminRoleSession: (...args: unknown[]) =>
    mockRequireAdminRoleSession(...args),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn().mockResolvedValue({
    t: (key: string) => key,
  }),
}))

jest.mock('@web/lib/db/queries/users', () => ({
  listUsers: jest.fn().mockResolvedValue([]),
}))

jest.mock('./components/UsersPageView', () => ({
  UsersPageView: jest.fn(({ title }: { title: string }) => (
    <div data-testid="users-page-view">{title}</div>
  )),
}))

describe('AdminUsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

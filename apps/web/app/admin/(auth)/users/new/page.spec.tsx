import { render, screen } from '@testing-library/react'

import { UserForm } from '../components/UserForm'
import NewUserPage from './page.next'

const mockRequireAdminRoleSession = vi.fn()

vi.mock('@web/lib/auth/requireAdminRoleSession', () => ({
  requireAdminRoleSession: (...args: unknown[]) =>
    mockRequireAdminRoleSession(...args),
}))

vi.mock('@web/i18n/server', () => ({
  getServerTranslation: vi.fn().mockResolvedValue({
    t: (key: string) => {
      const map: Record<string, string> = {
        'users.form.createTitle': 'Create User',
        'users.form.back': '← Back to users',
      }
      return map[key] ?? key
    },
  }),
}))

vi.mock('../components/UserForm', async () => {
  const React = await import('react')
  return {
    UserForm: vi
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'user-form' }),
      ),
  }
})

describe('NewUserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAdminRoleSession.mockResolvedValue(undefined)
  })

  it('renders UserForm', async () => {
    const ui = await NewUserPage()
    render(ui)
    expect(screen.getByTestId('user-form')).toBeInTheDocument()
  })

  it('passes translated title to UserForm', async () => {
    const ui = await NewUserPage()
    render(ui)
    expect(UserForm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Create User' }),
      undefined,
    )
  })

  it('passes translated back label to UserForm', async () => {
    const ui = await NewUserPage()
    render(ui)
    expect(UserForm).toHaveBeenCalledWith(
      expect.objectContaining({ backLabel: '← Back to users' }),
      undefined,
    )
  })

  it('throws when session check redirects', async () => {
    const err = new Error('NEXT_REDIRECT')
    mockRequireAdminRoleSession.mockRejectedValue(err)
    await expect(NewUserPage()).rejects.toBe(err)
  })
})

export {}

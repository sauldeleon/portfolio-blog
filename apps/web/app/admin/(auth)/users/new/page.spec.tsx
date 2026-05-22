import { render, screen } from '@testing-library/react'

import { UserForm } from '../components/UserForm'
import NewUserPage from './page.next'

const mockRequireAdminRoleSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminRoleSession', () => ({
  requireAdminRoleSession: (...args: unknown[]) =>
    mockRequireAdminRoleSession(...args),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn().mockResolvedValue({
    t: (key: string) => {
      const map: Record<string, string> = {
        'users.form.createTitle': 'Create User',
        'users.form.back': '← Back to users',
      }
      return map[key] ?? key
    },
  }),
}))

jest.mock('../components/UserForm', () => {
  const React = require('react')
  return {
    UserForm: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'user-form' }),
      ),
  }
})

describe('NewUserPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

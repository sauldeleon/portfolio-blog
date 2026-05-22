import { render, screen } from '@testing-library/react'

import { UserForm } from '../components/UserForm'
import EditUserPage from './page.next'

const mockRequireAdminRoleSession = jest.fn()
const mockGetUserById = jest.fn()
const mockNotFound = jest.fn()

jest.mock('@web/lib/auth/requireAdminRoleSession', () => ({
  requireAdminRoleSession: (...args: unknown[]) =>
    mockRequireAdminRoleSession(...args),
}))

jest.mock('@web/lib/db/queries/users', () => ({
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
}))

jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn().mockResolvedValue({
    t: (key: string) => {
      const map: Record<string, string> = {
        'users.form.editTitle': 'Edit User',
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

const mockUser = {
  id: 'user-1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('EditUserPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminRoleSession.mockResolvedValue(undefined)
    mockGetUserById.mockResolvedValue(mockUser)
  })

  it('renders UserForm', async () => {
    const ui = await EditUserPage({ params: Promise.resolve({ id: 'user-1' }) })
    render(ui)
    expect(screen.getByTestId('user-form')).toBeInTheDocument()
  })

  it('passes edit mode to UserForm', async () => {
    const ui = await EditUserPage({ params: Promise.resolve({ id: 'user-1' }) })
    render(ui)
    expect(UserForm).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'edit' }),
      undefined,
    )
  })

  it('passes translated title to UserForm', async () => {
    const ui = await EditUserPage({ params: Promise.resolve({ id: 'user-1' }) })
    render(ui)
    expect(UserForm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Edit User' }),
      undefined,
    )
  })

  it('passes initialValues from user record', async () => {
    const ui = await EditUserPage({ params: Promise.resolve({ id: 'user-1' }) })
    render(ui)
    expect(UserForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: {
          userId: 'user-1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
      }),
      undefined,
    )
  })

  it('calls notFound when user does not exist', async () => {
    mockGetUserById.mockResolvedValue(null)
    await EditUserPage({ params: Promise.resolve({ id: 'nonexistent' }) })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('throws when session check redirects', async () => {
    const err = new Error('NEXT_REDIRECT')
    mockRequireAdminRoleSession.mockRejectedValue(err)
    await expect(
      EditUserPage({ params: Promise.resolve({ id: 'user-1' }) }),
    ).rejects.toBe(err)
  })
})

export {}

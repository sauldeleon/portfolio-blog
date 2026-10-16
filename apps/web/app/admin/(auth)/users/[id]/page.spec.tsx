import { render, screen } from '@testing-library/react'

import { UserForm } from '../components/UserForm'
import EditUserPage from './page.next'

const mockRequireAdminRoleSession = vi.fn()
const mockGetUserById = vi.fn()
const mockNotFound = vi.fn()

vi.mock('@web/lib/auth/requireAdminRoleSession', () => ({
  requireAdminRoleSession: (...args: unknown[]) =>
    mockRequireAdminRoleSession(...args),
}))

vi.mock('@web/lib/db/queries/users', () => ({
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
}))

vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}))

vi.mock('@web/i18n/server', () => ({
  getServerTranslation: vi.fn().mockResolvedValue({
    t: (key: string) => {
      const map: Record<string, string> = {
        'users.form.editTitle': 'Edit User',
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
    vi.clearAllMocks()
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

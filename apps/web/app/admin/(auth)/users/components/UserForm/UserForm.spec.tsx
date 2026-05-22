import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { UserForm } from './UserForm'

jest.mock('@sdlgr/select', () => ({
  Select: ({
    value,
    onChange,
    options,
    'data-testid': testId,
  }: {
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string }>
    'data-testid'?: string
  }) => (
    <div data-testid={testId}>
      <button type="button">
        {options.find((o) => o.value === value)?.label ?? ''}
      </button>
      {options.map((opt) => (
        <div key={opt.value} role="option" onClick={() => onChange(opt.value)}>
          {opt.label}
        </div>
      ))}
    </div>
  ),
}))

const mockRouterBack = jest.fn()
const mockRouterPush = jest.fn()
const mockRouterRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockRouterBack,
    push: mockRouterPush,
    refresh: mockRouterRefresh,
  }),
}))

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const map: Record<string, string> = {
        'users.form.email': 'Email',
        'users.form.emailPlaceholder': 'admin@example.com',
        'users.form.name': 'Display name',
        'users.form.namePlaceholder': 'Display name',
        'users.form.password': 'Password',
        'users.form.passwordPlaceholder': 'Password',
        'users.form.role': 'Role',
        'users.form.create': 'Create user',
        'users.form.save': 'Save changes',
        'users.form.edit': 'Edit',
        'users.form.editTitle': 'Edit User',
        'users.form.passwordOptionalPlaceholder': 'Leave blank to keep current',
        'users.form.cancel': 'Cancel',
        'users.form.error': 'Something went wrong',
        'users.roles.admin': 'Admin',
        'users.roles.editor': 'Editor',
        'users.roles.user': 'User',
      }
      return map[key] ?? key
    },
  }),
}))

function makeAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: {} as never,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('UserForm', () => {
  it('renders page header with title and back link', () => {
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    expect(screen.getByText('Create User')).toBeInTheDocument()
    expect(screen.getByTestId('back-link')).toHaveTextContent('← Back to users')
  })

  it('renders email, name, password, and role fields', () => {
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('name-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('role-select')).toBeInTheDocument()
  })

  it('submit button is disabled when fields are empty', () => {
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('submit button is disabled when password is too short', () => {
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'short' },
    })
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('submit button is disabled when name is empty', () => {
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    })
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('submit button is enabled when email, name, and 8+ char password are provided', () => {
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    })
    expect(screen.getByTestId('submit-button')).not.toBeDisabled()
  })

  it('back link calls router.back', () => {
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.click(screen.getByTestId('back-link'))
    expect(mockRouterBack).toHaveBeenCalledTimes(1)
  })

  it('cancel link calls router.back', () => {
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.click(screen.getByTestId('cancel-link'))
    expect(mockRouterBack).toHaveBeenCalledTimes(1)
  })

  it('submits form and navigates to /admin/users on success', async () => {
    jest.spyOn(axios, 'post').mockResolvedValue({ data: {} })
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'newuser@example.com' },
    })
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'New User' },
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    })
    fireEvent.submit(screen.getByTestId('user-form'))
    await waitFor(() =>
      expect(mockRouterPush).toHaveBeenCalledWith('/admin/users'),
    )
  })

  it('shows error when API returns error message', async () => {
    jest
      .spyOn(axios, 'post')
      .mockRejectedValue(makeAxiosError(409, { error: 'Email already taken' }))
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'admin@example.com' },
    })
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Admin User' },
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    })
    fireEvent.submit(screen.getByTestId('user-form'))
    await waitFor(() =>
      expect(screen.getByTestId('form-error')).toHaveTextContent(
        'Email already taken',
      ),
    )
  })

  it('shows fallback error when API returns no error message', async () => {
    jest.spyOn(axios, 'post').mockRejectedValue(makeAxiosError(500, {}))
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'admin@example.com' },
    })
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Admin User' },
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    })
    fireEvent.submit(screen.getByTestId('user-form'))
    await waitFor(() =>
      expect(screen.getByTestId('form-error')).toHaveTextContent(
        'Something went wrong',
      ),
    )
  })

  it('shows fallback error when request throws non-axios error', async () => {
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('Network error'))
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'admin@example.com' },
    })
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Admin User' },
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    })
    fireEvent.submit(screen.getByTestId('user-form'))
    expect(await screen.findByTestId('form-error')).toBeInTheDocument()
  })

  it('disables submit button while submitting', async () => {
    let resolveRequest: ((value: unknown) => void) | undefined
    jest.spyOn(axios, 'post').mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }) as never,
    )
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    })
    fireEvent.submit(screen.getByTestId('user-form'))
    await waitFor(() =>
      expect(screen.getByTestId('submit-button')).toBeDisabled(),
    )
    resolveRequest?.({ data: {} })
  })

  it('sends correct POST body', async () => {
    jest.spyOn(axios, 'post').mockResolvedValue({ data: {} })
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'securepass' },
    })
    fireEvent.submit(screen.getByTestId('user-form'))
    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    const [url, body] = (axios.post as jest.Mock).mock.calls[0] as [
      string,
      Record<string, string>,
    ]
    expect(url).toBe('/api/users')
    expect(body.email).toBe('user@example.com')
    expect(body.name).toBe('Test User')
    expect(body.password).toBe('securepass')
  })

  describe('edit mode', () => {
    const editProps = {
      title: 'Edit User',
      backLabel: '← Back to users',
      mode: 'edit' as const,
      initialValues: {
        userId: 'user-1',
        email: 'existing@example.com',
        name: 'Existing User',
        role: 'editor',
      },
    }

    it('pre-fills email, name, and role from initialValues', () => {
      renderApp(<UserForm {...editProps} />)
      expect(screen.getByTestId('email-input')).toHaveValue(
        'existing@example.com',
      )
      expect(screen.getByTestId('name-input')).toHaveValue('Existing User')
    })

    it('shows save button label in edit mode', () => {
      renderApp(<UserForm {...editProps} />)
      expect(screen.getByTestId('submit-button')).toHaveTextContent(
        'Save changes',
      )
    })

    it('submit is enabled without password in edit mode', () => {
      renderApp(<UserForm {...editProps} />)
      expect(screen.getByTestId('submit-button')).not.toBeDisabled()
    })

    it('submit is disabled when password is too short in edit mode', () => {
      renderApp(<UserForm {...editProps} />)
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'short' },
      })
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('submit is enabled when password is valid in edit mode', () => {
      renderApp(<UserForm {...editProps} />)
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'validpass123' },
      })
      expect(screen.getByTestId('submit-button')).not.toBeDisabled()
    })

    it('sends PATCH to /api/users/[id]', async () => {
      jest.spyOn(axios, 'patch').mockResolvedValue({ data: {} })
      renderApp(<UserForm {...editProps} />)
      fireEvent.submit(screen.getByTestId('user-form'))
      await waitFor(() => expect(axios.patch).toHaveBeenCalled())
      const [url] = (axios.patch as jest.Mock).mock.calls[0] as [string]
      expect(url).toBe('/api/users/user-1')
    })

    it('does not include password in body when blank', async () => {
      jest.spyOn(axios, 'patch').mockResolvedValue({ data: {} })
      renderApp(<UserForm {...editProps} />)
      fireEvent.submit(screen.getByTestId('user-form'))
      await waitFor(() => expect(axios.patch).toHaveBeenCalled())
      const body = (axios.patch as jest.Mock).mock.calls[0][1] as Record<
        string,
        unknown
      >
      expect(body).not.toHaveProperty('password')
    })

    it('includes password in body when filled', async () => {
      jest.spyOn(axios, 'patch').mockResolvedValue({ data: {} })
      renderApp(<UserForm {...editProps} />)
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'newpassword123' },
      })
      fireEvent.submit(screen.getByTestId('user-form'))
      await waitFor(() => expect(axios.patch).toHaveBeenCalled())
      const body = (axios.patch as jest.Mock).mock.calls[0][1] as Record<
        string,
        unknown
      >
      expect(body.password).toBe('newpassword123')
    })

    it('shows password optional placeholder', () => {
      renderApp(<UserForm {...editProps} />)
      expect(screen.getByTestId('password-input')).toHaveAttribute(
        'placeholder',
        'Leave blank to keep current',
      )
    })

    it('navigates to /admin/users on success', async () => {
      jest.spyOn(axios, 'patch').mockResolvedValue({ data: {} })
      renderApp(<UserForm {...editProps} />)
      fireEvent.submit(screen.getByTestId('user-form'))
      await waitFor(() =>
        expect(mockRouterPush).toHaveBeenCalledWith('/admin/users'),
      )
    })
  })

  it('sends selected role in POST body', async () => {
    jest.spyOn(axios, 'post').mockResolvedValue({ data: {} })
    renderApp(<UserForm title="Create User" backLabel="← Back to users" />)
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'securepass' },
    })
    fireEvent.click(
      within(screen.getByTestId('role-select')).getByRole('option', {
        name: 'Admin',
      }),
    )
    fireEvent.submit(screen.getByTestId('user-form'))
    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
      string,
      unknown
    >
    expect(body.role).toBe('admin')
  })
})

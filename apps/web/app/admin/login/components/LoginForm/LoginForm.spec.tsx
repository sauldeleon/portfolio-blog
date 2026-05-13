import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { LoginForm } from './LoginForm'

const mockSignIn = jest.fn()
const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'login.username': 'Username',
        'login.password': 'Password',
        'login.showPassword': 'show',
        'login.hidePassword': 'hide',
        'login.signingIn': 'Signing in…',
        'login.signIn': 'Sign in',
        'login.invalidCredentials': 'Invalid credentials',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
  })

  it('renders username and password inputs and submit button', () => {
    renderApp(<LoginForm />)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/password/i, { selector: 'input' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('toggles password visibility', () => {
    renderApp(<LoginForm />)
    const passwordInput = screen.getByLabelText(/password/i, {
      selector: 'input',
    })
    expect(passwordInput).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByTestId('password-toggle'))
    expect(passwordInput).toHaveAttribute('type', 'text')
    fireEvent.click(screen.getByTestId('password-toggle'))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('shows loading state while signing in', async () => {
    let resolveSignIn: ((value: unknown) => void) | undefined
    mockSignIn.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve
      }),
    )

    renderApp(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'admin' },
    })
    fireEvent.change(
      screen.getByLabelText(/password/i, { selector: 'input' }),
      {
        target: { value: 'secret' },
      },
    )
    fireEvent.submit(screen.getByTestId('login-form'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled()
    })

    resolveSignIn?.({ error: null })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign in' })).not.toBeDisabled()
    })
  })

  it('shows error on failed signIn', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })

    renderApp(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'wrong' },
    })
    fireEvent.change(
      screen.getByLabelText(/password/i, { selector: 'input' }),
      {
        target: { value: 'wrong' },
      },
    )
    fireEvent.submit(screen.getByTestId('login-form'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('refreshes then redirects to /admin/posts on success', async () => {
    mockSignIn.mockResolvedValue({ error: null })

    renderApp(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'admin' },
    })
    fireEvent.change(
      screen.getByLabelText(/password/i, { selector: 'input' }),
      {
        target: { value: 'correct' },
      },
    )
    fireEvent.submit(screen.getByTestId('login-form'))

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/admin/posts')
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not redirect on error', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })

    renderApp(<LoginForm />)
    fireEvent.submit(screen.getByTestId('login-form'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('clears error on new submit attempt', async () => {
    mockSignIn
      .mockResolvedValueOnce({ error: 'CredentialsSignin' })
      .mockResolvedValueOnce({ error: null })

    renderApp(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'admin' },
    })
    fireEvent.change(
      screen.getByLabelText(/password/i, { selector: 'input' }),
      {
        target: { value: 'wrong' },
      },
    )
    fireEvent.submit(screen.getByTestId('login-form'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    fireEvent.submit(screen.getByTestId('login-form'))

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})

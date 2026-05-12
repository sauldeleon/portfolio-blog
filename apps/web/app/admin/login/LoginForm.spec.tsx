import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { LoginForm } from './LoginForm'

const mockSignIn = jest.fn()
const mockPush = jest.fn()

jest.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it('renders username and password inputs and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows loading state while signing in', async () => {
    let resolveSignIn: ((value: unknown) => void) | undefined
    mockSignIn.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve
      }),
    )

    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'admin' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret' },
    })
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

    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'wrong' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong' },
    })
    fireEvent.submit(screen.getByTestId('login-form'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to /admin/posts on success', async () => {
    mockSignIn.mockResolvedValue({ error: null })

    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'admin' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'correct' },
    })
    fireEvent.submit(screen.getByTestId('login-form'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/posts')
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not redirect on error', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })

    render(<LoginForm />)
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

    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'admin' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong' },
    })
    fireEvent.submit(screen.getByTestId('login-form'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    fireEvent.submit(screen.getByTestId('login-form'))

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})

import { render, screen } from '@testing-library/react'

import AuthLayout from './layout.next'

const mockRedirect = jest.fn()
const mockAuth = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

jest.mock('@web/lib/auth/config', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

jest.mock('../components/AdminNav', () => {
  const React = require('react')
  return {
    AdminNav: jest
      .fn()
      .mockReturnValue(
        React.createElement('nav', { 'data-testid': 'admin-nav' }),
      ),
  }
})

describe('AuthLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders admin nav and children when authenticated', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const ui = await AuthLayout({
      children: <div data-testid="child-content">Hello</div>,
    })
    render(ui)
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
    expect(screen.getByTestId('admin-nav')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects to /admin/login when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    await AuthLayout({ children: <div /> })
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })
})

import { render, screen } from '@testing-library/react'

import AuthLayout from './layout.next'

const mockRequireAdminSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
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
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
    const ui = await AuthLayout({
      children: <div data-testid="child-content">Hello</div>,
    })
    render(ui)
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
    expect(screen.getByTestId('admin-nav')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(mockRequireAdminSession).toHaveBeenCalledTimes(1)
  })
})

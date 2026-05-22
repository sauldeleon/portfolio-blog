import { render, screen } from '@testing-library/react'

import { AdminNav } from '../components/AdminNav'
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

const mockAdminNav = AdminNav as jest.Mock

describe('AuthLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders admin nav and children when authenticated', async () => {
    mockRequireAdminSession.mockResolvedValue({
      user: { id: 'admin', name: 'admin', role: 'admin' },
    })
    const ui = await AuthLayout({
      children: <div data-testid="child-content">Hello</div>,
    })
    render(ui)
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
    expect(screen.getByTestId('admin-nav')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(mockRequireAdminSession).toHaveBeenCalledTimes(1)
  })

  it('passes role from session to AdminNav', async () => {
    mockRequireAdminSession.mockResolvedValue({
      user: { id: 'u1', name: 'editor', role: 'editor' },
    })
    const ui = await AuthLayout({ children: <div /> })
    render(ui)
    const [[props]] = mockAdminNav.mock.calls
    expect(props).toMatchObject({ role: 'editor' })
  })
})

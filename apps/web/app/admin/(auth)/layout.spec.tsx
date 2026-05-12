import { render, screen } from '@testing-library/react'

import AuthLayout from './layout.next'

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
  it('renders admin nav and children', () => {
    render(
      <AuthLayout>
        <div data-testid="child-content">Hello</div>
      </AuthLayout>,
    )
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
    expect(screen.getByTestId('admin-nav')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})

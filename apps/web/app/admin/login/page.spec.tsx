import { render, screen } from '@testing-library/react'

import LoginPage from './page.next'

jest.mock('./LoginForm', () => {
  const React = require('react')
  return {
    LoginForm: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'login-form' }),
      ),
  }
})

describe('LoginPage', () => {
  it('renders the heading and LoginForm', () => {
    render(<LoginPage />)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Admin Login' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })
})

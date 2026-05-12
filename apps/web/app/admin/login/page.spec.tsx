import { render, screen } from '@testing-library/react'

import { LoginPage } from './components/LoginPage'
import Page from './page.next'

jest.mock('./components/LoginPage', () => {
  const React = require('react')
  return {
    LoginPage: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'login-page' }),
      ),
  }
})

describe('Page', () => {
  it('renders LoginPage', () => {
    render(<Page />)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(LoginPage).toHaveBeenCalled()
  })
})

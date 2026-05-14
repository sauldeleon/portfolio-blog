import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { LoginPage } from './LoginPage'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'login.title': 'Admin Login',
        'login.subtitle': 'Enter your credentials to continue',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('../LoginForm', () => {
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
    renderApp(<LoginPage />)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Admin Login' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    renderApp(<LoginPage />)
    expect(
      screen.getByText('Enter your credentials to continue'),
    ).toBeInTheDocument()
  })
})

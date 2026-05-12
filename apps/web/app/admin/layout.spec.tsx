import { render, screen } from '@testing-library/react'

import AdminLayout from './layout.next'

jest.mock('i18next', () => ({
  dir: jest.fn().mockReturnValue('ltr'),
}))

jest.mock('@sdlgr/main-theme', () => ({
  robotoMonoClassName: 'roboto-mono',
}))

jest.mock('@sdlgr/i18n-tools', () => ({
  LanguageContextProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}))

jest.mock(
  '@web/components/StyledComponentsRegistry/StyledComponentsRegistry',
  () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
  }),
)

jest.mock('@web/components/MainLayout/MainLayout', () => {
  const React = require('react')
  return {
    MainLayout: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'main-layout' }, children),
  }
})

jest.mock('./AdminNav', () => {
  const React = require('react')
  return {
    AdminNav: jest
      .fn()
      .mockReturnValue(
        React.createElement('nav', { 'data-testid': 'admin-nav' }),
      ),
  }
})

describe('AdminLayout', () => {
  it('renders the main layout with admin nav and children', () => {
    render(
      <AdminLayout>
        <div data-testid="child-content">Hello</div>
      </AdminLayout>,
    )
    expect(screen.getByTestId('main-layout')).toBeInTheDocument()
    expect(screen.getByTestId('admin-layout')).toBeInTheDocument()
    expect(screen.getByTestId('admin-nav')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})

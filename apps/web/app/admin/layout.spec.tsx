import { render, screen } from '@testing-library/react'
import { Children } from 'react'
import type { ReactElement, ReactNode } from 'react'

import AdminLayout from './layout.next'

jest.mock('./components/AdminQueryProvider', () => ({
  AdminQueryProvider: ({ children }: { children: React.ReactNode }) => children,
}))

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

function bodyChildren(layout: ReactElement): ReactNode {
  const { children: htmlChildren } = layout.props
  const body = Children.only(htmlChildren) as ReactElement<{
    children: ReactNode
  }>
  const { children: bodyContent } = body.props
  return bodyContent
}

describe('AdminLayout', () => {
  it('renders the main layout and children', () => {
    const layout = AdminLayout({
      children: <div data-testid="child-content">Hello</div>,
    })

    expect(layout.type).toBe('html')
    expect(layout.props.lang).toBe('en')

    render(<>{bodyChildren(layout)}</>)

    expect(screen.getByTestId('main-layout')).toBeInTheDocument()
    expect(screen.getByTestId('admin-layout')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})

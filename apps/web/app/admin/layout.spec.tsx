import { render, screen } from '@testing-library/react'
import { Children } from 'react'
import type { ReactElement, ReactNode } from 'react'

import AdminLayout from './layout.next'

vi.mock('./components/AdminQueryProvider', () => ({
  AdminQueryProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('i18next', () => ({
  dir: vi.fn().mockReturnValue('ltr'),
}))

vi.mock('@sdlgr/main-theme', () => ({
  robotoMonoClassName: 'roboto-mono',
}))

vi.mock('@sdlgr/i18n-tools', () => ({
  LanguageContextProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}))

vi.mock(
  '@web/components/StyledComponentsRegistry/StyledComponentsRegistry',
  () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
  }),
)

vi.mock('@web/components/MainLayout/MainLayout', async () => {
  const React = await import('react')
  return {
    MainLayout: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'main-layout' }, children),
  }
})

function bodyChildren(
  layout: ReactElement<{ children: ReactNode }>,
): ReactNode {
  const { children: htmlChildren } = layout.props
  const body = Children.toArray(htmlChildren).find(
    (child) => (child as ReactElement).type === 'body',
  ) as ReactElement<{ children: ReactNode }>
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

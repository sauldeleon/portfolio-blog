import { render, screen } from '@testing-library/react'
import { Children } from 'react'
import type { ReactElement, ReactNode } from 'react'

import PreviewLayout from './layout.next'

jest.mock('@sdlgr/i18n-tools', () => ({
  LanguageContextProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}))

jest.mock('@sdlgr/main-theme', () => ({
  robotoMonoClassName: 'roboto-mono',
}))

jest.mock('@web/components/MainLayout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}))

jest.mock(
  '@web/components/StyledComponentsRegistry/StyledComponentsRegistry',
  () =>
    ({ children }: { children: React.ReactNode }) =>
      children,
)

jest.mock('../../../globals.css', () => ({}))

function bodyChildren(layout: ReactElement): ReactNode {
  const { children: htmlChildren } = layout.props
  const body = Children.only(htmlChildren) as ReactElement<{
    children: ReactNode
  }>
  const { children: bodyContent } = body.props
  return bodyContent
}

describe('blog/preview/[token] - PreviewLayout', () => {
  it('renders children inside main layout', () => {
    const layout = PreviewLayout({ children: 'content' })

    render(<>{bodyChildren(layout)}</>)

    expect(screen.getByTestId('main-layout')).toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('sets html lang to en', () => {
    const layout = PreviewLayout({ children: 'content' })

    expect(layout.type).toBe('html')
    expect(layout.props.lang).toBe('en')
  })
})

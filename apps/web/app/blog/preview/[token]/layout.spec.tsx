import { render, screen } from '@testing-library/react'

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

describe('blog/preview/[token] - PreviewLayout', () => {
  it('renders children inside main layout', () => {
    render(<PreviewLayout>content</PreviewLayout>)
    expect(screen.getByTestId('main-layout')).toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('sets html lang to en', () => {
    render(<PreviewLayout>content</PreviewLayout>)
    expect(document.documentElement.lang).toBe('en')
  })
})

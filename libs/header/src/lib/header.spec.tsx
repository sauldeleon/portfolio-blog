import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Header } from './header'

describe('Header', () => {
  it('should render successfully with no items', () => {
    renderWithTheme(<Header actionItem="wadus" />)
    expect(screen.getByText('slLogo.svg')).toBeTruthy()
  })

  it('should render links', () => {
    renderWithTheme(
      <Header
        items={[
          { href: 'a', label: 'a' },
          { href: 'b', label: 'b', hideOnDesktop: true },
        ]}
        actionItem="wadus"
      />
    )
    expect(screen.getAllByRole('link')).toHaveLength(3)
    expect(screen.getByText('wadus')).toBeInTheDocument()
    expect(screen.getByText('b')).toHaveStyle('display:block')
  })
})

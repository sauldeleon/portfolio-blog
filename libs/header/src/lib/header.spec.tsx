import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Header } from './header'

describe('Header', () => {
  it('should render successfully with no items', () => {
    renderWithTheme(<Header logo="slLogo.svg" actionItem="wadus" />)
    expect(screen.getByText(/slLogo.svg/)).toBeTruthy()
    expect(screen.getByText(/wadus/)).toBeTruthy()
  })

  it('should render links', () => {
    renderWithTheme(
      <Header
        navItems={[
          { href: 'a', label: 'a' },
          { href: 'b', label: 'b', hideOnDesktop: true },
        ]}
        actionItem="wadus"
      />
    )
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByText('wadus')).toBeInTheDocument()
    expect(screen.getAllByText('b')[1]).toHaveStyle('display:block')
  })
})

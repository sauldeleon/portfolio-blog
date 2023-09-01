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
          { href: 'a', label: 'a', ariaLabel: 'go to a', isActive: true },
          { href: 'b', label: 'b', ariaLabel: 'go to b', isActive: false },
          {
            href: 'c',
            label: 'c',
            ariaLabel: 'go to c',
            isActive: false,
            hideOnDesktop: true,
          },
        ]}
        actionItem="wadus"
      />
    )
    expect(screen.getAllByRole('link')).toHaveLength(3)
    expect(screen.getAllByRole('listitem', { current: 'page' })).toHaveLength(1)
    expect(screen.getByText('wadus')).toBeInTheDocument()
    expect(screen.getByText('b')).toHaveStyle('display:block')
  })
})

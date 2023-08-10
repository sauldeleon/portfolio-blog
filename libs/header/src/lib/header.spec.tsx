import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Header } from './header'

describe('Header', () => {
  it('should render successfully with no items', () => {
    renderWithTheme(<Header />)
    expect(screen.getByText('slLogo.svg')).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('should render links', () => {
    renderWithTheme(
      <Header
        items={[
          { href: 'a', label: 'a' },
          { href: 'b', label: 'b' },
        ]}
      />
    )
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })
})

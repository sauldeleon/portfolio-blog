import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Header } from './header'

describe('Header', () => {
  it('should render successfully with no items', () => {
    renderWithTheme(<Header actionButtonLabel="wadus" />)
    expect(screen.getByText('slLogo.svg')).toBeTruthy()
  })

  it('should render links', () => {
    renderWithTheme(
      <Header
        items={[
          { href: 'a', label: 'a' },
          { href: 'b', label: 'b' },
        ]}
        actionButtonLabel="wadus"
      />
    )
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })
})

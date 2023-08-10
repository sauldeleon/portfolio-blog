import { render, screen } from '@testing-library/react'

import { Header } from './header'

describe('Header', () => {
  it('should render successfully with no items', () => {
    render(<Header />)
    expect(screen.getByText('slLogo.svg')).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('should render links', () => {
    render(
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

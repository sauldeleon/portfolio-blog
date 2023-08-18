import { screen } from '@testing-library/react'

import { MoonIcon, TelegramIcon } from '@sdlgr/assets'
import { renderWithTheme } from '@sdlgr/test-utils'

import { Footer } from './footer'

describe('Footer', () => {
  it('should render successfully with no navItems', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByText('slLogo.svg')).toBeInTheDocument()
  })

  it('should render with icons', () => {
    renderWithTheme(
      <Footer
        navItems={[
          { label: 'test', href: '/test' },
          {
            label: 'dark',
            href: '#',
            icon: <MoonIcon />,
          },
        ]}
        socialMediaItems={[
          {
            icon: <TelegramIcon />,
            label: 'Telegram',
            href: '/telegram',
          },
        ]}
      />
    )
    expect(screen.getAllByRole('link')).toHaveLength(3)
    expect(screen.getByText('moon.svg')).toBeInTheDocument()
    expect(screen.getByText('telegram.svg')).toBeInTheDocument()
  })
})

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MoonIcon, TelegramIcon } from '@sdlgr/assets'
import { renderWithTheme } from '@sdlgr/test-utils'

import { Footer } from './footer'

describe('Footer', () => {
  it('should render successfully with no navItems', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByText('slLogo.svg')).toBeInTheDocument()
  })

  it('should render with icons', () => {
    const mockClick = jest.fn()
    renderWithTheme(
      <Footer
        navItems={[
          { label: 'test', ariaLabel: 'Go to test', href: '/test' },
          {
            label: 'Click me',
            ariaLabel: 'Click me',
            onClick: mockClick(),
          },
          {
            label: 'dark',
            ariaLabel: 'Be dark',
            href: '#',
            icon: <MoonIcon />,
          },
        ]}
        socialMediaItems={[
          {
            icon: <TelegramIcon />,
            ariaLabel: 'My Telegram user id',
            href: '/telegram',
          },
        ]}
      />
    )
    expect(screen.getAllByRole('link')).toHaveLength(3)
    expect(screen.getByText('moon.svg')).toBeInTheDocument()
    expect(screen.getByText('telegram.svg')).toBeInTheDocument()
    userEvent.click(screen.getByText('Click me'))
    expect(mockClick).toHaveBeenCalledTimes(1)
  })
})

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MoonIcon, TelegramIcon } from '@sdlgr/assets'
import { renderWithTheme } from '@sdlgr/test-utils'

import { Footer } from './footer'

describe('Footer', () => {
  it('should render successfully with no navItems', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should render with icons', async () => {
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
      />,
    )
    expect(screen.getAllByRole('link')).toHaveLength(3)
    expect(screen.getByRole('link', { name: 'Be dark' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'My Telegram user id' }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByText('Click me'))
    expect(mockClick).toHaveBeenCalledTimes(1)
  })
})

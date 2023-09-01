import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { Footer } from './Footer'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Footer />)
    await screen.findByRole('navigation')
    expect(screen.getAllByRole('link')).toHaveLength(6)
    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(baseElement).toMatchSnapshot()
  })

  it('should trigger actions in buttons successfully', async () => {
    jest.spyOn(console, 'log')
    const mockFn = jest.fn()
    ;(console.log as jest.Mock).mockImplementation(mockFn)

    renderApp(<Footer />)
    await screen.findByRole('navigation')
    await userEvent.click(screen.getByRole('button', { name: /Dark mode/ }))
    await userEvent.click(screen.getByRole('button', { name: /Pain mode/ }))
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should toggle language to Spanish', async () => {
    ;(usePathname as jest.Mock).mockImplementation(() => '/en/path/slug')
    renderApp(<Footer />)
    await screen.findByRole('navigation')
    const toggleLanguageButton = screen.getByRole('button', {
      name: /Toggle language/,
    })
    await userEvent.click(toggleLanguageButton)
    expect(mockPush).toHaveBeenNthCalledWith(1, '/es/path/slug')
  })

  it('should toggle language to English', async () => {
    ;(usePathname as jest.Mock).mockImplementation(() => '/es/path/slug')
    renderApp(<Footer />, undefined, { language: 'es' })
    await screen.findByRole('navigation')
    const toggleLanguageButton = screen.getByRole('button', {
      name: /Toggle language/,
    })
    await userEvent.click(toggleLanguageButton)
    expect(mockPush).toHaveBeenNthCalledWith(1, '/en/path/slug')
  })
})

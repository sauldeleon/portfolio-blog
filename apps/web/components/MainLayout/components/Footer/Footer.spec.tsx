import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { Footer } from './Footer'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockImplementation(() => '/en'),
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockSet = jest.fn()
jest.mock('@sdlgr/storage', () => ({
  ...jest.requireActual('@sdlgr/storage'),
  useStorage: jest.fn().mockImplementation(() => [jest.fn(), mockSet]),
}))

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Footer />)
    await screen.findByRole('navigation')
    expect(screen.getAllByRole('link')).toHaveLength(8)
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
    await userEvent.click(screen.getByRole('button', { name: /About/ }))
    expect(mockFn).toHaveBeenCalledTimes(3)
  })

  it('should toggle language to next available language', async () => {
    ;(usePathname as jest.Mock).mockImplementation(() => '/en/path/slug')
    renderApp(<Footer />)
    await screen.findByRole('navigation')
    const toggleLanguageButton = screen.getByRole('link', {
      name: /Toggle language/,
    })
    expect(toggleLanguageButton).toHaveAttribute('href', '/es/path/slug')
    await userEvent.click(toggleLanguageButton)
    expect(mockSet).toHaveBeenNthCalledWith(1, 'webLng', 'es')
    expect(mockPush).toHaveBeenNthCalledWith(1, '/es/path/slug')
  })
})

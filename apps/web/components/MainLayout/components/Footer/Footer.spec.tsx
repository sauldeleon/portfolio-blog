import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'
import type { Mock } from 'vitest'

import { renderApp } from '@sdlgr/test-utils'

import { Footer } from './Footer'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockImplementation(() => '/en'),
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockSet = vi.fn()
vi.mock('@sdlgr/storage', async () => ({
  ...(await vi.importActual<typeof import('@sdlgr/storage')>('@sdlgr/storage')),
  useStorage: vi.fn().mockImplementation(() => [vi.fn(), mockSet]),
}))

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Footer />)
    await screen.findByRole('navigation')
    expect(screen.getAllByRole('link')).toHaveLength(8)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(baseElement).toMatchSnapshot()
  })

  it('should trigger open about modal', async () => {
    renderApp(<Footer />)
    await screen.findByRole('navigation')
    await userEvent.click(screen.getByRole('button', { name: /About/ }))
    expect(await screen.findByText('About this page')).toBeInTheDocument()
  })

  it('should toggle language to next available language', async () => {
    ;(usePathname as Mock).mockImplementation(() => '/en/path/slug')
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

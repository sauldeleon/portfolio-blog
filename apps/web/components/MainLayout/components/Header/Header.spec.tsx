import { screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import type { Mock } from 'vitest'

import { renderApp } from '@sdlgr/test-utils'

import { Header } from './Header'

vi.mock('next/navigation', async () => ({
  ...(await vi.importActual<typeof import('next/navigation')>(
    'next/navigation',
  )),
  useSelectedLayoutSegments: vi.fn(() => ['(home)', 'contact']),
  usePathname: vi.fn(() => '/en/contact'),
}))

describe('Header', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Header />)
    const nav = await screen.findByRole('navigation')
    expect(nav).toBeTruthy()
    expect(screen.getAllByRole('link')).toHaveLength(5)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render logo without link on homepage', async () => {
    ;(usePathname as Mock).mockReturnValue('/en/')
    const { baseElement } = renderApp(<Header />)
    await screen.findByRole('navigation')
    expect(
      screen.queryByRole('link', { name: /Saúl de León Guerrero, navigate/i }),
    ).toBeNull()
    expect(baseElement).toMatchSnapshot()
  })
})

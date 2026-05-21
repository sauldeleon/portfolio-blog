import { screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { Header } from './Header'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useSelectedLayoutSegments: jest.fn(() => ['(home)', 'contact']),
  usePathname: jest.fn(() => '/en/contact'),
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
    ;(usePathname as jest.Mock).mockReturnValue('/en/')
    const { baseElement } = renderApp(<Header />)
    await screen.findByRole('navigation')
    expect(
      screen.queryByRole('link', { name: /Saúl de León Guerrero, navigate/i }),
    ).toBeNull()
    expect(baseElement).toMatchSnapshot()
  })
})

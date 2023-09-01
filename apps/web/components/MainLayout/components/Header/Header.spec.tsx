import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { Header } from './Header'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: () => '/en/contact',
}))

describe('Header', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Header />)
    const nav = await screen.findByRole('navigation')
    expect(nav).toBeTruthy()
    expect(screen.getAllByRole('link')).toHaveLength(6)
    expect(baseElement).toMatchSnapshot()
  })
})

import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { Header } from './Header'

describe('Header', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Header />)
    const nav = await screen.findByRole('navigation')
    expect(nav).toBeTruthy()
    expect(screen.getAllByRole('link')).toHaveLength(4)
    expect(baseElement).toMatchSnapshot()
  })
})

import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { Footer } from './Footer'

describe('Footer', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Footer />)
    await screen.findByRole('navigation')
    expect(screen.getAllByRole('link')).toHaveLength(8)
    expect(baseElement).toMatchSnapshot()
  })
})

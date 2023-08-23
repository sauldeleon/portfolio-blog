import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page from './page.next'

describe('[lng]/contact - Page', () => {
  it('should render successfully', async () => {
    renderApp(<Page />)
    const text = await screen.findByText('Contact me')
    expect(text).toBeInTheDocument()
  })
})

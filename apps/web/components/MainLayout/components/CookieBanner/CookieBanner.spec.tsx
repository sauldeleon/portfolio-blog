import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { CookieBanner } from './CookieBanner'

describe('CookieBanner', () => {
  it('should render', async () => {
    renderApp(<CookieBanner />)
    expect(await screen.findByText('Accept')).toBeInTheDocument()
  })

  it('should close banner', async () => {
    renderApp(<CookieBanner />)
    await screen.findByText('Accept')
    await userEvent.click(screen.getByText('Accept'))
    expect(screen.queryByText('Accept')).not.toBeInTheDocument()
  })
})

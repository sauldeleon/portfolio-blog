import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page from './page.next'

jest.mock('@sdlgr/use-is-bot', () => ({
  useIsBot: () => jest.fn().mockReturnValue({ isBot: false, isLoading: false }),
}))

describe('[lng]/contact - Page', () => {
  it('should render successfully', async () => {
    renderApp(<Page />)
    const text = await screen.findByText('Software Engineer')
    expect(text).toBeInTheDocument()
    expect(screen.getByText(/E-mail/)).toBeInTheDocument()
    expect(screen.getByText(/Phone/)).toBeInTheDocument()
  })
})

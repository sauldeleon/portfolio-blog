import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { ContactPage } from './ContactPage'

jest.mock('@sdlgr/use-is-bot', () => ({
  useIsBot: () => jest.fn().mockReturnValue({ isBot: false, isLoading: false }),
}))

describe('ContactPage', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<ContactPage />)
    await screen.findByText('Software Engineer')
    expect(baseElement).toMatchSnapshot()
  })

  it('should swap images onClick', async () => {
    renderApp(<ContactPage />)
    await screen.findByText('Software Engineer')

    await userEvent.click(screen.getByAltText(/My profile picture/))
    expect(
      await screen.findByAltText('My toothless profile picture')
    ).toBeInTheDocument()
    await userEvent.click(screen.getByAltText(/My toothless profile picture/))
    expect(await screen.findByAltText('My profile picture')).toBeInTheDocument()
  })
})

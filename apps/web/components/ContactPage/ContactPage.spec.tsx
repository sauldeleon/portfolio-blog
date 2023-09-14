import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'
import { useIsBot } from '@sdlgr/use-is-bot'

import { ContactPage } from './ContactPage'

jest.mock('@sdlgr/use-is-bot', () => ({
  useIsBot: jest.fn(),
}))

describe('ContactPage', () => {
  it('should render successfully', async () => {
    ;(useIsBot as jest.Mock).mockReturnValue({
      isBot: false,
      isLoading: false,
    })
    const { baseElement } = renderApp(<ContactPage />)
    await screen.findByText('Software Engineer')
    expect(baseElement).toMatchSnapshot()
  })

  it('should swap images onClick', async () => {
    ;(useIsBot as jest.Mock).mockReturnValue({
      isBot: false,
      isLoading: false,
    })
    renderApp(<ContactPage />)
    await screen.findByText('Software Engineer')

    await userEvent.click(screen.getAllByAltText(/My profile picture/)[0])
    expect(
      await screen.findByAltText('My toothless profile picture'),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByAltText(/My toothless profile picture/))
    expect(await screen.findAllByAltText(/My profile picture/)).toHaveLength(6)
  })

  it('should hide contact info if bot info is loading', async () => {
    ;(useIsBot as jest.Mock).mockReturnValue({
      isBot: false,
      isLoading: true,
    })
    renderApp(<ContactPage />)
    await screen.findByText('Software Engineer')
    expect(screen.getByTestId('contact-info')).toHaveStyleRule('opacity', '0')
  })
})

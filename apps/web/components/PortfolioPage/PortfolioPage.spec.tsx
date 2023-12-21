import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useIsScrolling } from 'react-use-is-scrolling'

import { renderApp } from '@sdlgr/test-utils'

import { PortfolioPage } from './PortfolioPage'

jest.mock('react-use-is-scrolling', () => {
  return {
    useIsScrolling: jest.fn().mockImplementation(() => ({
      isScrolling: false,
      scrollDirectionY: 'none',
    })),
  }
})

describe('PortfolioPage', () => {
  beforeAll(() => {
    Object.defineProperty(global.document.body, 'offsetHeight', {
      get: () => 7000,
    })
    Object.defineProperty(global.window, 'innerHeight', {
      get: () => 1400,
    })
    global.scrollTo = jest.fn()
  })

  it('should render successfully', async () => {
    const { baseElement } = renderApp(<PortfolioPage />)
    expect(await screen.findByText('Profile')).toBeInTheDocument()

    expect(screen.getByTestId('scrollColumn')).toHaveStyleRule('opacity: 0')
    expect(screen.getByTestId('scrollToTop')).toHaveStyleRule('translateY: 0px')
    expect(baseElement).toMatchSnapshot()
  })

  it('should show scroll to top button', async () => {
    ;(useIsScrolling as jest.Mock).mockReturnValueOnce({
      isScrolling: true,
      scrollDirectionY: 'down',
    })

    const watcher = jest.spyOn(global.window, 'scrollTo')

    renderApp(<PortfolioPage />)
    expect(await screen.findByText('Profile')).toBeInTheDocument()

    const scrollColumn = screen.getByTestId('scrollColumn')
    const scrollToTopButton = screen.getByTestId('scrollToTop')

    expect(scrollColumn).toHaveStyleRule('opacity: 0')
    expect(scrollToTopButton).toHaveStyleRule('translateY: -40px')

    fireEvent.scroll(window, { target: { scrollY: 1500 } })

    expect(scrollToTopButton).toHaveStyleRule('opacity: 1')
    expect(scrollToTopButton).toHaveStyleRule('translateY: -40px')

    await userEvent.click(scrollToTopButton)

    expect(watcher).toHaveBeenCalledTimes(1)
    expect(watcher).toHaveBeenNthCalledWith(1, 0, 0)
  })

  it('should scroll top when user scrolls', async () => {
    ;(useIsScrolling as jest.Mock).mockReturnValueOnce({
      isScrolling: true,
      scrollDirectionY: 'up',
    })

    const watcher = jest.spyOn(global.window, 'scrollTo')

    renderApp(<PortfolioPage />)
    expect(await screen.findByText('Profile')).toBeInTheDocument()

    const scrollColumn = screen.getByTestId('scrollColumn')
    const scrollToTopButton = screen.getByTestId('scrollToTop')

    expect(scrollColumn).toHaveStyleRule('opacity: 0')
    expect(scrollToTopButton).toHaveStyleRule('translateY: 40px')

    fireEvent.scroll(window, { target: { scrollY: 1500 } })

    expect(scrollToTopButton).toHaveStyleRule('opacity: 1')
    expect(scrollToTopButton).toHaveStyleRule('translateY: 40px')

    await userEvent.click(scrollToTopButton)

    expect(watcher).toHaveBeenCalledTimes(1)
    expect(watcher).toHaveBeenNthCalledWith(1, 0, 0)
  })
})

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { Footer } from './Footer'

describe('Footer', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Footer />)
    await screen.findByRole('navigation')
    expect(screen.getAllByRole('link')).toHaveLength(6)
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(baseElement).toMatchSnapshot()
  })

  it('should trigger actions in buttons successfully', async () => {
    jest.spyOn(console, 'log')
    const mockFn = jest.fn()
    ;(console.log as jest.Mock).mockImplementation(mockFn)

    renderApp(<Footer />)
    await screen.findByRole('navigation')
    await userEvent.click(screen.getByRole('button', { name: /Dark mode/ }))
    await userEvent.click(screen.getByRole('button', { name: /Pain mode/ }))
    expect(mockFn).toHaveBeenCalledTimes(2)
  })
})

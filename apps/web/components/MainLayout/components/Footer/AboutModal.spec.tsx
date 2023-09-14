import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { AboutModal } from './AboutModal'

describe('AboutModal', () => {
  it('should render', async () => {
    const { baseElement } = renderApp(
      <AboutModal isOpen setIsOpen={jest.fn()} />,
    )
    await screen.findByText('About this page')
    expect(baseElement).toMatchSnapshot()
  })

  it('should close', async () => {
    const mockFn = jest.fn()
    renderApp(<AboutModal isOpen setIsOpen={mockFn} />)
    const closeButton = await screen.findByText('close.svg')
    await userEvent.click(closeButton)
    expect(mockFn).toHaveBeenNthCalledWith(1, false)
  })

  it('should close on backdrop event', async () => {
    const mockFn = jest.fn()
    renderApp(<AboutModal isOpen setIsOpen={mockFn} />)
    const closeButton = await screen.findByText('close.svg')
    fireEvent.keyDown(closeButton, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    })
    expect(mockFn).toHaveBeenNthCalledWith(1, false)
  })
})

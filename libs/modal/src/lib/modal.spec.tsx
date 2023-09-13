import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import Modal from './modal'

describe('Modal', () => {
  it('should render successfully', () => {
    renderApp(
      <Modal isOpen setIsOpen={jest.fn()}>
        <div>test</div>
      </Modal>
    )
    expect(screen.getByText('test')).toBeTruthy()
  })

  it('should close', async () => {
    const mockFn = jest.fn()
    renderApp(
      <Modal isOpen setIsOpen={mockFn}>
        <div>test</div>
      </Modal>
    )
    const closeButton = await screen.findByText('close.svg')
    await userEvent.click(closeButton)
    expect(mockFn).toHaveBeenNthCalledWith(1, false)
  })

  it('should close on backdrop event', async () => {
    const mockFn = jest.fn()
    renderApp(
      <Modal isOpen setIsOpen={mockFn}>
        <div>test</div>
      </Modal>
    )
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

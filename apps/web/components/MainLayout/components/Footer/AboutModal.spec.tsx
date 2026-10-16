import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { AboutModal } from './AboutModal'

describe('AboutModal', () => {
  it('should render', async () => {
    const { baseElement } = renderApp(<AboutModal isOpen setIsOpen={vi.fn()} />)
    await screen.findByText('About this page')
    // react-overlays locks <body> scrolling in an effect after the modal
    // mounts; wait for it so the snapshot does not race that effect.
    await waitFor(() =>
      expect(document.body).toHaveStyle({ overflow: 'hidden' }),
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should close', async () => {
    const mockFn = vi.fn()
    renderApp(<AboutModal isOpen setIsOpen={mockFn} />)
    const closeButton = await screen.findByRole('button', { name: /close/i })
    await userEvent.click(closeButton)
    expect(mockFn).toHaveBeenNthCalledWith(1, false)
  })

  it('should close on backdrop event', async () => {
    const mockFn = vi.fn()
    renderApp(<AboutModal isOpen setIsOpen={mockFn} />)
    const closeButton = await screen.findByRole('button', { name: /close/i })
    fireEvent.keyDown(closeButton, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    })
    expect(mockFn).toHaveBeenNthCalledWith(1, false)
  })
})

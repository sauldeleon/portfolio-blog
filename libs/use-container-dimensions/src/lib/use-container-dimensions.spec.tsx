import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import React, { useRef } from 'react'

import { useContainerDimensions } from './use-container-dimensions'

function TestComponent() {
  const ref = useRef<HTMLDivElement>(null)
  const dimensions = useContainerDimensions(ref)

  return (
    <>
      <div ref={ref} style={{ height: 200, width: 200 }} />
      <div data-testid="width">{dimensions.width}</div>
      <div data-testid="height">{dimensions.height}</div>
    </>
  )
}

describe('useContainerDimensions', () => {
  it('should initialize be initialized to 0', () => {
    const ref = React.createRef<HTMLElement>()
    const { result } = renderHook(() => useContainerDimensions(ref))
    expect(result).toEqual({
      current: {
        height: 300,
        width: 0,
      },
    })
  })

  it('should return default dimensions on resize', () => {
    const ref = React.createRef<HTMLElement>()

    const { result, rerender } = renderHook(() => useContainerDimensions(ref))
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    rerender()
    expect(result).toEqual({
      current: {
        height: 300,
        width: 0,
      },
    })
  })

  it('should return refs dimensions on resize', async () => {
    render(<TestComponent />)
    const width = screen.getByTestId('width')
    const height = screen.getByTestId('height')

    await waitFor(() => {
      expect(height).toHaveTextContent('0')
    })

    act(() => {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        value: 100,
      })
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        value: 500,
      })

      window.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => {
      expect(width).toHaveTextContent('500')
    })
    expect(height).toHaveTextContent('100')
  })
})

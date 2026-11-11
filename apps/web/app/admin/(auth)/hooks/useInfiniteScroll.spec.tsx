import { render } from '@testing-library/react'
import { useRef } from 'react'

import { useInfiniteScroll } from './useInfiniteScroll'

let observerCallback: IntersectionObserverCallback
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  global.IntersectionObserver = vi.fn(function (
    cb: IntersectionObserverCallback,
  ) {
    observerCallback = cb
    return { observe: mockObserve, disconnect: mockDisconnect }
  }) as unknown as typeof IntersectionObserver
})

function trigger(isIntersecting: boolean) {
  observerCallback(
    [{ isIntersecting }] as IntersectionObserverEntry[],
    {} as IntersectionObserver,
  )
}

function Harness({
  onReachEnd,
  withSentinel = true,
}: {
  onReachEnd: () => void
  withSentinel?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useInfiniteScroll(ref, onReachEnd)
  return withSentinel ? <div ref={ref} data-testid="sentinel" /> : null
}

describe('useInfiniteScroll', () => {
  it('observes the sentinel and calls back when it becomes visible', () => {
    const onReachEnd = vi.fn()
    render(<Harness onReachEnd={onReachEnd} />)
    expect(mockObserve).toHaveBeenCalled()
    trigger(false)
    expect(onReachEnd).not.toHaveBeenCalled()
    trigger(true)
    expect(onReachEnd).toHaveBeenCalledTimes(1)
  })

  it('uses the latest callback without re-creating the observer', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<Harness onReachEnd={first} />)
    rerender(<Harness onReachEnd={second} />)
    trigger(true)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalled()
    expect(global.IntersectionObserver).toHaveBeenCalledTimes(1)
  })

  it('disconnects on unmount', () => {
    const { unmount } = render(<Harness onReachEnd={vi.fn()} />)
    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('does nothing without a sentinel', () => {
    render(<Harness onReachEnd={vi.fn()} withSentinel={false} />)
    expect(global.IntersectionObserver).not.toHaveBeenCalled()
  })
})

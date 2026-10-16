import { act, render, screen } from '@testing-library/react'

import { useFillViewport } from './useFillViewport'

function Filler() {
  const { ref, height } = useFillViewport<HTMLDivElement>(1024)
  return <div ref={ref} data-testid="filler" data-height={height ?? 'auto'} />
}

function setViewport(width: number, height: number) {
  Object.assign(window, { innerWidth: width, innerHeight: height })
}

beforeEach(() => {
  window.scrollTo = vi.fn()
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 200,
  } as DOMRect)
  document.documentElement.style.overflow = ''
})

afterEach(() => vi.restoreAllMocks())

describe('useFillViewport', () => {
  it('fills the space below the element and locks page scroll', () => {
    setViewport(1440, 900)
    const { unmount } = render(<Filler />)
    expect(screen.getByTestId('filler')).toHaveAttribute('data-height', '700')
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)

    setViewport(1440, 1000)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(screen.getByTestId('filler')).toHaveAttribute('data-height', '800')

    unmount()
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('keeps the normal flow on narrow screens', () => {
    setViewport(800, 900)
    render(<Filler />)
    expect(screen.getByTestId('filler')).toHaveAttribute('data-height', 'auto')
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('releases the lock when the window gets narrow', () => {
    setViewport(1440, 900)
    render(<Filler />)
    setViewport(800, 900)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(screen.getByTestId('filler')).toHaveAttribute('data-height', 'auto')
    expect(document.documentElement.style.overflow).toBe('')
  })
})

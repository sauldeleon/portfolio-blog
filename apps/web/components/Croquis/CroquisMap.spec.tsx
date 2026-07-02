import { act, fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CroquisObstacle } from '@web/lib/cards'

import { CroquisMap } from './CroquisMap'

afterEach(() => jest.useRealTimers())

function ob(overrides: Partial<CroquisObstacle> = {}): CroquisObstacle {
  return {
    type: 'salto',
    title: 'Jump one',
    meters: 5,
    side: null,
    severity: 'easy',
    notes: [],
    ...overrides,
  }
}

describe('CroquisMap', () => {
  it('renders one interactive group per obstacle', () => {
    renderApp(
      <CroquisMap obstacles={[ob(), ob({ title: 'Second' })]} lang="en" />,
    )
    expect(screen.getByTestId('croquis-svg')).toBeInTheDocument()
    expect(screen.getByTestId('croquis-obstacle-0')).toBeInTheDocument()
    expect(screen.getByTestId('croquis-obstacle-1')).toBeInTheDocument()
  })

  it('opens the popover on mouse enter and closes shortly after leave', () => {
    jest.useFakeTimers()
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    const popover = screen.getByTestId('croquis-popover')
    expect(popover).toHaveAttribute('data-open', 'false')
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    expect(popover).toHaveAttribute('data-open', 'true')
    expect(screen.getByText('Jump one')).toBeInTheDocument()
    fireEvent.mouseLeave(screen.getByTestId('croquis-obstacle-0'))
    // Deferred: still open right after leaving.
    expect(popover).toHaveAttribute('data-open', 'true')
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(popover).toHaveAttribute('data-open', 'false')
  })

  it('keeps the popover open while the mouse is over it', () => {
    jest.useFakeTimers()
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    const popover = screen.getByTestId('croquis-popover')
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    fireEvent.mouseLeave(screen.getByTestId('croquis-obstacle-0'))
    // Mouse travels into the popover before the close timer fires.
    fireEvent.mouseEnter(popover)
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(popover).toHaveAttribute('data-open', 'true')
    // Leaving the popover then closes it.
    fireEvent.mouseLeave(popover)
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(popover).toHaveAttribute('data-open', 'false')
  })

  it('opens on tap (click) for touch devices', () => {
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    fireEvent.click(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.getByTestId('croquis-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('closes when tapping outside any obstacle', () => {
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    fireEvent.click(screen.getByTestId('croquis-obstacle-0'))
    fireEvent.pointerDown(document.body)
    expect(screen.getByTestId('croquis-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('stays open when the pointer-down lands on an obstacle', () => {
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    fireEvent.click(screen.getByTestId('croquis-obstacle-0'))
    fireEvent.pointerDown(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.getByTestId('croquis-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('closes on Escape but ignores other keys', () => {
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    fireEvent.click(screen.getByTestId('croquis-obstacle-0'))
    fireEvent.keyDown(document, { key: 'a' })
    expect(screen.getByTestId('croquis-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByTestId('croquis-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('opens on focus and closes on blur', () => {
    jest.useFakeTimers()
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    fireEvent.focus(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.getByTestId('croquis-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
    fireEvent.blur(screen.getByTestId('croquis-obstacle-0'))
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(screen.getByTestId('croquis-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('shows the obstacle photo when present', () => {
    renderApp(
      <CroquisMap obstacles={[ob({ photo: 'https://x/y.jpg' })]} lang="en" />,
    )
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    const img = screen.getByAltText('Jump one') as HTMLImageElement
    expect(img.src).toBe('https://x/y.jpg')
  })

  it('falls back to a drawn scene without a photo', () => {
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows metres, side and severity chips', () => {
    renderApp(
      <CroquisMap
        obstacles={[ob({ meters: 8, side: 'left', severity: 'danger' })]}
        lang="en"
      />,
    )
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.getByText('8 m')).toBeInTheDocument()
    expect(screen.getByText('LEFT')).toBeInTheDocument()
    expect(screen.getByText('DANGER')).toBeInTheDocument()
  })

  it('shows the right-side label and caution severity', () => {
    renderApp(
      <CroquisMap
        obstacles={[ob({ side: 'right', severity: 'caution' })]}
        lang="en"
      />,
    )
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.getByText('RIGHT')).toBeInTheDocument()
    expect(screen.getByText('CAUTION')).toBeInTheDocument()
  })

  it('omits the metres chip when unknown', () => {
    renderApp(<CroquisMap obstacles={[ob({ meters: null })]} lang="en" />)
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.queryByText(/ m$/)).not.toBeInTheDocument()
  })

  it('lists the notes', () => {
    renderApp(
      <CroquisMap
        obstacles={[ob({ notes: [{ text: 'Aim centre', sub: false }] })]}
        lang="en"
      />,
    )
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.getByText('Aim centre')).toBeInTheDocument()
  })

  it.each([
    ['rapel', 'RAPPEL'],
    ['tobogan', 'SLIDE'],
    ['salto', 'JUMP'],
    ['salto-rapel', 'JUMP / RAPPEL'],
  ] as const)('labels a %s obstacle as %s', (type, label) => {
    renderApp(<CroquisMap obstacles={[ob({ type })]} lang="en" />)
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('translates the popover to Spanish', () => {
    renderApp(<CroquisMap obstacles={[ob({ type: 'rapel' })]} lang="es" />)
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.getByText('RÁPEL')).toBeInTheDocument()
  })

  it('positions the popover below when there is no room above', () => {
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    const popover = screen.getByTestId('croquis-popover')
    expect(popover.style.top).toBe('12px')
    expect(popover.style.left).toBe('8px')
  })

  it('positions the popover above and clamps a far-right element', () => {
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 400,
      bottom: 450,
      left: 2000,
      right: 2100,
      width: 100,
      height: 50,
      x: 2000,
      y: 400,
      toJSON: () => ({}),
    } as DOMRect)
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    const popover = screen.getByTestId('croquis-popover')
    expect(popover.style.top).toBe('138px')
    expect(Number.parseInt(popover.style.left, 10)).toBeLessThan(2000)
    jest.restoreAllMocks()
  })
})

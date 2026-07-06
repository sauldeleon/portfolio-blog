import { act, fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CardZone } from '@web/lib/cards'

import { InteractiveCardMap } from './InteractiveCardMap'

beforeAll(() => {
  // @ts-expect-error override for jsdom
  window.PointerEvent = class extends MouseEvent {}
})

afterEach(() => jest.useRealTimers())

const ZONES: CardZone[] = [
  { id: 'wide', kind: 'grade', key: 'x', x: 10, y: 10, w: 120, h: 60 },
  { id: 'narrow', kind: 'phenomenon', key: 'y', x: 200, y: 10, w: 40, h: 40 },
]

function setup(
  props: Partial<React.ComponentProps<typeof InteractiveCardMap>> = {},
) {
  renderApp(
    <InteractiveCardMap
      svg="<g></g>"
      zones={ZONES}
      isWide={(z) => z.kind === 'grade'}
      zoneLabel={(z) => `label-${z.id}`}
      renderPopover={(z) => <span data-testid="popover-body">body-{z.id}</span>}
      {...props}
    />,
  )
}

describe('InteractiveCardMap', () => {
  it('renders the card svg, overlay and a zone per entry', () => {
    setup()
    expect(screen.getByTestId('card-svg')).toBeInTheDocument()
    expect(screen.getByTestId('card-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('card-zone-wide')).toBeInTheDocument()
    expect(screen.getByTestId('card-zone-narrow')).toBeInTheDocument()
  })

  it('renders a marker dot on each interactive zone', () => {
    setup()
    expect(screen.getByTestId('card-marker-wide')).toBeInTheDocument()
    expect(screen.getByTestId('card-marker-narrow')).toBeInTheDocument()
  })

  it('renders no hint by default', () => {
    setup()
    expect(screen.queryByTestId('card-hint')).not.toBeInTheDocument()
  })

  it('renders the hint caption when provided', () => {
    setup({ hint: 'Tap the zones' })
    expect(screen.getByTestId('card-hint')).toHaveTextContent('Tap the zones')
  })

  it('labels each zone', () => {
    setup()
    expect(screen.getByTestId('card-zone-wide')).toHaveAttribute(
      'aria-label',
      'label-wide',
    )
  })

  it('opens on hover by default and renders the popover content', () => {
    setup()
    fireEvent.mouseEnter(screen.getByTestId('card-zone-wide'))
    const pop = screen.getByTestId('card-popover')
    expect(pop).toHaveAttribute('data-open', 'true')
    expect(pop).toHaveTextContent('body-wide')
  })

  it('closes after mouse-leave via the deferred timer', () => {
    jest.useFakeTimers()
    setup()
    const zone = screen.getByTestId('card-zone-wide')
    fireEvent.mouseEnter(zone)
    fireEvent.mouseLeave(zone)
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('keeps the popover open while hovering it', () => {
    jest.useFakeTimers()
    setup()
    fireEvent.mouseEnter(screen.getByTestId('card-zone-wide'))
    const pop = screen.getByTestId('card-popover')
    fireEvent.mouseLeave(screen.getByTestId('card-zone-wide'))
    fireEvent.mouseEnter(pop)
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(pop).toHaveAttribute('data-open', 'true')
    fireEvent.mouseLeave(pop)
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(pop).toHaveAttribute('data-open', 'false')
  })

  it('does not open on hover in click-only mode', () => {
    setup({ interaction: 'click' })
    const zone = screen.getByTestId('card-zone-narrow')
    fireEvent.mouseEnter(zone)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
    fireEvent.click(zone)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
    fireEvent.mouseLeave(zone)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('closes on an outside pointer-down but not on a zone one', () => {
    setup()
    const zone = screen.getByTestId('card-zone-wide')
    fireEvent.click(zone)
    fireEvent.pointerDown(zone)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
    fireEvent.pointerDown(document.body)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('closes on Escape but ignores other keys', () => {
    setup()
    fireEvent.click(screen.getByTestId('card-zone-wide'))
    fireEvent.keyDown(document, { key: 'a' })
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('opens on focus and closes on blur', () => {
    jest.useFakeTimers()
    setup()
    const zone = screen.getByTestId('card-zone-narrow')
    fireEvent.focus(zone)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
    fireEvent.blur(zone)
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('keeps the popover open when focus moves into it', () => {
    jest.useFakeTimers()
    setup()
    const zone = screen.getByTestId('card-zone-narrow')
    fireEvent.focus(zone)
    const pop = screen.getByTestId('card-popover')
    fireEvent.blur(zone, { relatedTarget: pop })
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(pop).toHaveAttribute('data-open', 'true')
  })

  it('places the popover below the zone when it does not fit above', () => {
    const spy = jest
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        top: 600,
        bottom: 640,
        left: 500,
        right: 600,
        width: 100,
        height: 40,
        x: 500,
        y: 600,
        toJSON: () => ({}),
      } as DOMRect)
    setup()
    fireEvent.click(screen.getByTestId('card-zone-narrow'))
    const pop = screen.getByTestId('card-popover')
    expect(parseFloat(pop.style.top)).toBeGreaterThan(8)
    spy.mockRestore()
  })
})

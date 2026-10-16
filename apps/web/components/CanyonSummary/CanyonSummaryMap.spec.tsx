import { act, fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CanyoningCardData } from '@web/lib/cards'

import { CanyonSummaryMap } from './CanyonSummaryMap'

beforeAll(() => {
  // @ts-expect-error override for jsdom
  window.PointerEvent = class extends MouseEvent {}
})

afterEach(() => vi.useRealTimers())

function data(overrides: Partial<CanyoningCardData> = {}): CanyoningCardData {
  return {
    kind: 'canyoning-data',
    lang: 'en',
    grade: 'v4 a3 III',
    flowLevel: 'normal',
    flowRappels: 'some_water',
    phenomena: ['murky', 'siphon'],
    ...overrides,
  }
}

describe('CanyonSummaryMap', () => {
  it('renders the card and an interactive zone per grade / flow / phenomenon', () => {
    renderApp(<CanyonSummaryMap data={data()} />)
    expect(screen.getByTestId('card-svg')).toBeInTheDocument()
    expect(screen.getByTestId('card-overlay')).toBeInTheDocument()
    for (const id of [
      'grade-vert',
      'grade-aqua',
      'grade-commit',
      'flow',
      'phenomenon-murky',
      'phenomenon-siphon',
    ]) {
      expect(screen.getByTestId(`card-zone-${id}`)).toBeInTheDocument()
    }
  })

  it('shows the click hint when there are interactive zones', () => {
    renderApp(<CanyonSummaryMap data={data()} />)
    expect(screen.getByTestId('card-hint')).toHaveTextContent(
      'Tap the highlighted areas',
    )
  })

  it('renders no zones (and no hint) when there is no grade or flow', () => {
    renderApp(
      <CanyonSummaryMap data={{ kind: 'canyoning-data', lang: 'en' }} />,
    )
    expect(screen.queryByTestId('card-zone-flow')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-zone-grade-vert')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-hint')).not.toBeInTheDocument()
  })

  it('opens the verticality scale on hover', () => {
    renderApp(<CanyonSummaryMap data={data()} />)
    fireEvent.mouseEnter(screen.getByTestId('card-zone-grade-vert'))
    const pop = screen.getByTestId('card-popover')
    expect(pop).toHaveAttribute('data-open', 'true')
    expect(pop).toHaveTextContent('Verticality scale')
    expect(screen.getByTestId('canyon-scale-v4')).toBeInTheDocument()
    expect(screen.getByTestId('canyon-scale-v1')).toBeInTheDocument()
  })

  it('shows level names for the vertical scale but not for commitment', () => {
    renderApp(<CanyonSummaryMap data={data()} />)
    fireEvent.mouseEnter(screen.getByTestId('card-zone-grade-vert'))
    expect(screen.getByTestId('canyon-scale-v4')).toHaveTextContent(
      'Fairly difficult',
    )
    fireEvent.mouseEnter(screen.getByTestId('card-zone-grade-commit'))
    expect(screen.getByTestId('card-popover')).toHaveTextContent(
      'Commitment scale',
    )
    // The commitment rows carry no difficulty name, only the criteria text.
    expect(screen.getByTestId('canyon-scale-III')).toBeInTheDocument()
  })

  it('opens the aquatic scale', () => {
    renderApp(<CanyonSummaryMap data={data()} />)
    fireEvent.mouseEnter(screen.getByTestId('card-zone-grade-aqua'))
    expect(screen.getByTestId('card-popover')).toHaveTextContent(
      'Aquatic scale',
    )
    expect(screen.getByTestId('canyon-scale-a3')).toBeInTheDocument()
  })

  it('opens the flow scale with the affects-rappels line', () => {
    renderApp(<CanyonSummaryMap data={data()} />)
    fireEvent.mouseEnter(screen.getByTestId('card-zone-flow'))
    const pop = screen.getByTestId('card-popover')
    expect(pop).toHaveTextContent('Observed flow')
    expect(screen.getByTestId('canyon-flow-normal')).toBeInTheDocument()
    expect(pop).toHaveTextContent('Some rappels have water')
  })

  it('omits the affects-rappels line when no value is set', () => {
    renderApp(<CanyonSummaryMap data={data({ flowRappels: undefined })} />)
    fireEvent.mouseEnter(screen.getByTestId('card-zone-flow'))
    expect(screen.getByTestId('card-popover')).not.toHaveTextContent(
      'Effect on the rappels',
    )
  })

  it('opens a phenomenon explanation', () => {
    renderApp(<CanyonSummaryMap data={data()} />)
    fireEvent.mouseEnter(screen.getByTestId('card-zone-phenomenon-murky'))
    const pop = screen.getByTestId('card-popover')
    expect(pop).toHaveTextContent('Murky water')
    expect(pop).toHaveTextContent('underwater visibility')
  })

  it('localises to Spanish', () => {
    renderApp(<CanyonSummaryMap data={data({ lang: 'es' })} />)
    fireEvent.mouseEnter(screen.getByTestId('card-zone-grade-vert'))
    expect(screen.getByTestId('card-popover')).toHaveTextContent(
      'Escala de verticalidad',
    )
  })

  it('closes after mouse-leave via the deferred timer', () => {
    vi.useFakeTimers()
    renderApp(<CanyonSummaryMap data={data()} />)
    const zone = screen.getByTestId('card-zone-flow')
    fireEvent.mouseEnter(zone)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
    fireEvent.mouseLeave(zone)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('keeps the popover open while hovering it', () => {
    vi.useFakeTimers()
    renderApp(<CanyonSummaryMap data={data()} />)
    fireEvent.mouseEnter(screen.getByTestId('card-zone-flow'))
    const pop = screen.getByTestId('card-popover')
    fireEvent.mouseLeave(screen.getByTestId('card-zone-flow'))
    fireEvent.mouseEnter(pop)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(pop).toHaveAttribute('data-open', 'true')
    fireEvent.mouseLeave(pop)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(pop).toHaveAttribute('data-open', 'false')
  })

  it('does not open on hover in click-only mode', () => {
    renderApp(<CanyonSummaryMap data={data()} interaction="click" />)
    const zone = screen.getByTestId('card-zone-flow')
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
    // mouse-leave must not close it in click mode
    fireEvent.mouseLeave(zone)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('opens on click (tap)', () => {
    renderApp(<CanyonSummaryMap data={data()} />)
    fireEvent.click(screen.getByTestId('card-zone-grade-vert'))
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('closes on an outside pointer-down but not on a zone/popover one', () => {
    renderApp(<CanyonSummaryMap data={data()} />)
    const zone = screen.getByTestId('card-zone-flow')
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
    renderApp(<CanyonSummaryMap data={data()} />)
    fireEvent.click(screen.getByTestId('card-zone-flow'))
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
    vi.useFakeTimers()
    renderApp(<CanyonSummaryMap data={data()} />)
    const zone = screen.getByTestId('card-zone-flow')
    fireEvent.focus(zone)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
    fireEvent.blur(zone)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('keeps the popover open when focus moves into it', () => {
    vi.useFakeTimers()
    renderApp(<CanyonSummaryMap data={data()} />)
    const zone = screen.getByTestId('card-zone-flow')
    fireEvent.focus(zone)
    const pop = screen.getByTestId('card-popover')
    fireEvent.blur(zone, { relatedTarget: pop })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(pop).toHaveAttribute('data-open', 'true')
  })

  it('places the popover below the zone when it does not fit above', () => {
    const spy = vi
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
    renderApp(<CanyonSummaryMap data={data()} />)
    fireEvent.click(screen.getByTestId('card-zone-flow'))
    const pop = screen.getByTestId('card-popover')
    // top = 600 - 12 - 400 = 188 (>= 8) → no flip, stays above.
    expect(parseFloat(pop.style.top)).toBeGreaterThan(8)
    spy.mockRestore()
  })
})

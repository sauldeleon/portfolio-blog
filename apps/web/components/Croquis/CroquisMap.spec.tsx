import { act, fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CroquisObstacle } from '@web/lib/cards'

import { CroquisMap } from './CroquisMap'

// jsdom's PointerEvent drops clientX; back it with MouseEvent so swipe coords
// survive fireEvent.pointerDown/Up.
beforeAll(() => {
  // @ts-expect-error override for jsdom
  window.PointerEvent = class extends MouseEvent {}
})

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

  it('shows the obstacle photo when present (single, no thumbnail strip)', () => {
    renderApp(
      <CroquisMap
        obstacles={[ob({ photos: ['https://x/y.jpg'] })]}
        lang="en"
      />,
    )
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    const img = screen.getByAltText('Jump one') as HTMLImageElement
    expect(img.src).toBe('https://x/y.jpg')
    expect(screen.queryByTestId('croquis-thumb-0')).not.toBeInTheDocument()
  })

  it('shows a thumbnail strip and switches the main image for multiple photos', () => {
    renderApp(
      <CroquisMap
        obstacles={[ob({ photos: ['https://x/a.jpg', 'https://x/b.jpg'] })]}
        lang="en"
      />,
    )
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    expect((screen.getByAltText('Jump one') as HTMLImageElement).src).toBe(
      'https://x/a.jpg',
    )
    expect(screen.getByTestId('croquis-thumb-0')).toBeInTheDocument()
    expect(screen.getByTestId('croquis-thumb-1')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('croquis-thumb-1'))
    expect((screen.getByAltText('Jump one') as HTMLImageElement).src).toBe(
      'https://x/b.jpg',
    )
  })

  it('falls back to a drawn scene without a photo', () => {
    renderApp(<CroquisMap obstacles={[ob()]} lang="en" />)
    fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  describe('gallery swipe + fullscreen', () => {
    const twoPhotos = () =>
      ob({ photos: ['https://x/a.jpg', 'https://x/b.jpg'] })

    function openPopover(obstacle = twoPhotos()) {
      renderApp(<CroquisMap obstacles={[obstacle]} lang="en" />)
      fireEvent.mouseEnter(screen.getByTestId('croquis-obstacle-0'))
      return screen.getByTestId('croquis-media')
    }

    const mainSrc = () =>
      (screen.getByAltText('Jump one') as HTMLImageElement).src

    it('swipes left to the next image and right to the previous', () => {
      const media = openPopover()
      expect(mainSrc()).toBe('https://x/a.jpg')
      fireEvent.pointerDown(media, { clientX: 120 })
      fireEvent.pointerUp(media, { clientX: 60 })
      expect(mainSrc()).toBe('https://x/b.jpg')
      fireEvent.pointerDown(media, { clientX: 60 })
      fireEvent.pointerUp(media, { clientX: 120 })
      expect(mainSrc()).toBe('https://x/a.jpg')
    })

    it('opens the fullscreen viewer on a plain tap', () => {
      const media = openPopover()
      fireEvent.pointerDown(media, { clientX: 100 })
      fireEvent.pointerUp(media, { clientX: 108 })
      expect(screen.getByTestId('croquis-lightbox-image')).toHaveAttribute(
        'src',
        'https://x/a.jpg',
      )
    })

    it('ignores a pointer-up without a start', () => {
      const media = openPopover()
      fireEvent.pointerUp(media, { clientX: 50 })
      expect(screen.queryByTestId('croquis-lightbox')).not.toBeInTheDocument()
    })

    it('does not open the viewer from a scene (photo-less) tap', () => {
      const media = openPopover(ob())
      fireEvent.pointerDown(media, { clientX: 10 })
      fireEvent.pointerUp(media, { clientX: 12 })
      expect(screen.queryByTestId('croquis-lightbox')).not.toBeInTheDocument()
    })

    it('does not switch or open on a single-photo swipe', () => {
      const media = openPopover(ob({ photos: ['https://x/only.jpg'] }))
      fireEvent.pointerDown(media, { clientX: 120 })
      fireEvent.pointerUp(media, { clientX: 40 })
      expect(mainSrc()).toBe('https://x/only.jpg')
      expect(screen.queryByTestId('croquis-lightbox')).not.toBeInTheDocument()
    })

    it('navigates and closes the fullscreen viewer', () => {
      const media = openPopover()
      fireEvent.pointerDown(media, { clientX: 100 })
      fireEvent.pointerUp(media, { clientX: 105 })
      const lightImg = () =>
        screen.getByTestId('croquis-lightbox-image') as HTMLImageElement
      expect(lightImg().src).toBe('https://x/a.jpg')
      fireEvent.click(screen.getByTestId('croquis-lightbox-next'))
      expect(lightImg().src).toBe('https://x/b.jpg')
      fireEvent.click(screen.getByTestId('croquis-lightbox-prev'))
      expect(lightImg().src).toBe('https://x/a.jpg')
      // Clicking the image itself does not close it.
      fireEvent.click(lightImg())
      expect(screen.getByTestId('croquis-lightbox')).toBeInTheDocument()
      // A non-Escape key leaves it open; Escape closes it.
      fireEvent.keyDown(document, { key: 'a' })
      expect(screen.getByTestId('croquis-lightbox')).toBeInTheDocument()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByTestId('croquis-lightbox')).not.toBeInTheDocument()
    })

    it('closes the viewer on the backdrop and the close button', () => {
      const media = openPopover()
      fireEvent.pointerDown(media, { clientX: 100 })
      fireEvent.pointerUp(media, { clientX: 100 })
      fireEvent.click(screen.getByTestId('croquis-lightbox'))
      expect(screen.queryByTestId('croquis-lightbox')).not.toBeInTheDocument()
      // Reopen and close via the × button.
      fireEvent.pointerDown(media, { clientX: 100 })
      fireEvent.pointerUp(media, { clientX: 100 })
      fireEvent.click(screen.getByTestId('croquis-lightbox-close'))
      expect(screen.queryByTestId('croquis-lightbox')).not.toBeInTheDocument()
    })
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

import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { TableOfContents } from './TableOfContents'
import type { TocEntry } from './TableOfContents'

const mockObserve = jest.fn()
const mockDisconnect = jest.fn()
let mockCallback: (entries: IntersectionObserverEntry[]) => void

beforeAll(() => {
  global.IntersectionObserver = jest.fn((callback) => {
    mockCallback = callback
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: jest.fn(),
    }
  }) as unknown as typeof IntersectionObserver
  jest.spyOn(window.history, 'pushState').mockImplementation(() => undefined)
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

const entries: TocEntry[] = [
  { depth: 2, text: 'Introduction', id: 'introduction' },
  { depth: 3, text: 'Sub Section', id: 'sub-section' },
  { depth: 2, text: 'Conclusion', id: 'conclusion' },
]

describe('TableOfContents', () => {
  it('renders null when entries is empty', () => {
    const { container } = renderWithTheme(
      <TableOfContents entries={[]} label="Table of contents" />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the label', () => {
    renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )
    expect(screen.getByText('Table of contents')).toBeInTheDocument()
  })

  it('renders all entry links', () => {
    renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )
    expect(screen.getByRole('link', { name: 'Introduction' })).toHaveAttribute(
      'href',
      '#introduction',
    )
    expect(screen.getByRole('link', { name: 'Sub Section' })).toHaveAttribute(
      'href',
      '#sub-section',
    )
    expect(screen.getByRole('link', { name: 'Conclusion' })).toHaveAttribute(
      'href',
      '#conclusion',
    )
  })

  it('sets up IntersectionObserver for each entry', () => {
    const headingEl = document.createElement('h2')
    headingEl.id = 'introduction'
    document.body.appendChild(headingEl)

    renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )
    expect(mockObserve).toHaveBeenCalledWith(headingEl)

    document.body.removeChild(headingEl)
  })

  it('marks active entry when intersection fires', () => {
    const headingEl = document.createElement('h2')
    headingEl.id = 'introduction'
    document.body.appendChild(headingEl)

    renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )

    act(() => {
      mockCallback([
        {
          isIntersecting: true,
          target: headingEl,
        } as unknown as IntersectionObserverEntry,
      ])
    })

    act(() => {
      jest.runAllTimers()
    })

    expect(screen.getByRole('link', { name: 'Introduction' })).toHaveAttribute(
      'aria-current',
      'location',
    )

    document.body.removeChild(headingEl)
  })

  it('does not update active when no visible entries', () => {
    renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )

    act(() => {
      mockCallback([
        {
          isIntersecting: false,
          target: { id: 'introduction' },
        } as unknown as IntersectionObserverEntry,
      ])
    })

    expect(
      screen.queryByRole('link', { name: 'Introduction' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('disconnects observer on unmount', () => {
    const { unmount } = renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )
    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('activates last entry when scrolled near bottom of page', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 9300,
    })
    Object.defineProperty(document.body, 'offsetHeight', {
      writable: true,
      configurable: true,
      value: 10000,
    })

    renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    act(() => {
      jest.runAllTimers()
    })

    expect(screen.getByRole('link', { name: 'Conclusion' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  it('does not activate last entry when not near bottom', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })
    Object.defineProperty(document.body, 'offsetHeight', {
      writable: true,
      configurable: true,
      value: 10000,
    })

    renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(
      screen.queryByRole('link', { name: 'Conclusion' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('clears pending intersection debounce on unmount', () => {
    const headingEl = document.createElement('h2')
    headingEl.id = 'introduction'
    document.body.appendChild(headingEl)

    const { unmount } = renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )

    act(() => {
      mockCallback([
        {
          isIntersecting: true,
          target: headingEl,
        } as unknown as IntersectionObserverEntry,
      ])
    })

    unmount()
    act(() => {
      jest.runAllTimers()
    })

    document.body.removeChild(headingEl)
  })

  it('clears pending scroll debounce on unmount', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 9300,
    })
    Object.defineProperty(document.body, 'offsetHeight', {
      writable: true,
      configurable: true,
      value: 10000,
    })

    const { unmount } = renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    unmount()
    act(() => {
      jest.runAllTimers()
    })
  })

  it('skips scroll activation when page fits in viewport', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 10000,
    })
    Object.defineProperty(document.body, 'offsetHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })

    renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(
      screen.queryByRole('link', { name: 'Conclusion' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('skips observing headings not found in DOM', () => {
    renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )
    expect(mockObserve).not.toHaveBeenCalled()
  })

  it('renders depth-1 entry with no negative indent', () => {
    renderWithTheme(
      <TableOfContents
        entries={[{ depth: 1, text: 'Top Level', id: 'top-level' }]}
        label="Table of contents"
      />,
    )
    expect(screen.getByRole('link', { name: 'Top Level' })).toBeInTheDocument()
  })

  describe('link click scrolling', () => {
    let headingEl: HTMLElement
    let scrollIntoView: jest.Mock

    beforeEach(() => {
      headingEl = document.createElement('h2')
      headingEl.id = 'introduction'
      scrollIntoView = jest.fn()
      headingEl.scrollIntoView = scrollIntoView
      document.body.appendChild(headingEl)
    })

    afterEach(() => {
      document.body.removeChild(headingEl)
    })

    it('scrolls immediately when all images are loaded', () => {
      renderWithTheme(
        <TableOfContents entries={entries} label="Table of contents" />,
      )
      fireEvent.click(screen.getByRole('link', { name: 'Introduction' }))
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
      expect(window.history.pushState).toHaveBeenCalledWith(
        null,
        '',
        '#introduction',
      )
    })

    it('does nothing when target element not found in DOM', () => {
      renderWithTheme(
        <TableOfContents
          entries={[{ depth: 2, text: 'Missing', id: 'not-in-dom' }]}
          label="Table of contents"
        />,
      )
      expect(() =>
        fireEvent.click(screen.getByRole('link', { name: 'Missing' })),
      ).not.toThrow()
      expect(scrollIntoView).not.toHaveBeenCalled()
    })

    it('waits for pending images then scrolls on load', async () => {
      const img = document.createElement('img')
      Object.defineProperty(img, 'complete', {
        get: () => false,
        configurable: true,
      })
      document.body.appendChild(img)

      renderWithTheme(
        <TableOfContents entries={entries} label="Table of contents" />,
      )
      fireEvent.click(screen.getByRole('link', { name: 'Introduction' }))
      expect(scrollIntoView).not.toHaveBeenCalled()

      fireEvent.load(img)
      await waitFor(() =>
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' }),
      )

      document.body.removeChild(img)
    })

    it('waits for pending images then scrolls on error', async () => {
      const img = document.createElement('img')
      Object.defineProperty(img, 'complete', {
        get: () => false,
        configurable: true,
      })
      document.body.appendChild(img)

      renderWithTheme(
        <TableOfContents entries={entries} label="Table of contents" />,
      )
      fireEvent.click(screen.getByRole('link', { name: 'Introduction' }))
      expect(scrollIntoView).not.toHaveBeenCalled()

      fireEvent.error(img)
      await waitFor(() =>
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' }),
      )

      document.body.removeChild(img)
    })

    it('scrolls via fallback timeout when images never load', () => {
      const img = document.createElement('img')
      Object.defineProperty(img, 'complete', {
        get: () => false,
        configurable: true,
      })
      document.body.appendChild(img)

      renderWithTheme(
        <TableOfContents entries={entries} label="Table of contents" />,
      )
      fireEvent.click(screen.getByRole('link', { name: 'Introduction' }))
      expect(scrollIntoView).not.toHaveBeenCalled()

      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })

      document.body.removeChild(img)
    })

    it('clears fallback timeout when images load before timeout', async () => {
      const img = document.createElement('img')
      Object.defineProperty(img, 'complete', {
        get: () => false,
        configurable: true,
      })
      document.body.appendChild(img)

      renderWithTheme(
        <TableOfContents entries={entries} label="Table of contents" />,
      )
      fireEvent.click(screen.getByRole('link', { name: 'Introduction' }))

      fireEvent.load(img)
      await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))

      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(scrollIntoView).toHaveBeenCalledTimes(1)

      document.body.removeChild(img)
    })
  })
})

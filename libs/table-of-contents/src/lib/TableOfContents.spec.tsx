import { act, screen } from '@testing-library/react'

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
})

beforeEach(() => {
  jest.clearAllMocks()
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

  it('skips observing headings not found in DOM', () => {
    renderWithTheme(
      <TableOfContents entries={entries} label="Table of contents" />,
    )
    expect(mockObserve).not.toHaveBeenCalled()
  })
})

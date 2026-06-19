import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { PostStickyBar } from './PostStickyBar'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSet = jest.fn()
jest.mock('@sdlgr/storage', () => ({
  ...jest.requireActual('@sdlgr/storage'),
  useStorage: jest.fn().mockImplementation(() => [jest.fn(), mockSet]),
}))

jest.mock('@sdlgr/post-hero', () => ({
  ShareButtons: ({ url, title }: { url: string; title: string }) => (
    <div data-testid="share-buttons" data-url={url} data-title={title} />
  ),
}))

const mockLanguageIcon = jest.fn()
const mockScrollTopIcon = jest.fn()
jest.mock('@sdlgr/assets', () => ({
  LanguageIcon: (...args: unknown[]) => mockLanguageIcon(...args),
  ScrollTop: (...args: unknown[]) => mockScrollTopIcon(...args),
}))

let observerCallback: IntersectionObserverCallback
const mockObserve = jest.fn()
const mockDisconnect = jest.fn()

beforeAll(() => {
  global.IntersectionObserver = jest.fn((cb) => {
    observerCallback = cb
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: jest.fn(),
    }
  }) as unknown as typeof IntersectionObserver
})

const defaultProps = {
  title: 'My Post Title',
  url: 'https://example.com/en/blog/5/my-post',
  altLangPath: '/es/blog/5/mi-post',
  altLangLabel: 'ES',
  altLangAriaLabel: 'Switch to Spanish',
  copyLinkLabel: 'Copy link',
  copiedLabel: 'Copied!',
}

describe('PostStickyBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLanguageIcon.mockReturnValue(null)
    mockScrollTopIcon.mockReturnValue(null)
  })

  it('renders sentinel and bar', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(screen.getByTestId('sticky-bar-sentinel')).toBeInTheDocument()
    expect(screen.getByTestId('sticky-bar')).toBeInTheDocument()
  })

  it('bar is aria-hidden when sentinel is intersecting', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(screen.getByTestId('sticky-bar')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('bar becomes visible when sentinel leaves viewport', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    expect(screen.getByTestId('sticky-bar')).toHaveAttribute(
      'aria-hidden',
      'false',
    )
  })

  it('bar goes back to hidden when sentinel re-enters viewport', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    expect(screen.getByTestId('sticky-bar')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('renders title', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(screen.getByText('My Post Title')).toBeInTheDocument()
  })

  it('renders share buttons with correct props', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    const share = screen.getByTestId('share-buttons')
    expect(share).toHaveAttribute('data-url', defaultProps.url)
    expect(share).toHaveAttribute('data-title', defaultProps.title)
  })

  it('renders lang button with aria-label', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(screen.getByTestId('lang-switch-button')).toHaveAttribute(
      'aria-label',
      'Switch to Spanish',
    )
  })

  it('renders lang button label text', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(screen.getByTestId('lang-switch-button')).toHaveTextContent('ES')
  })

  it('lang button click pushes altLangPath and sets storage', async () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to Spanish' }),
    )
    expect(mockSet).toHaveBeenCalledWith('webLng', 'es')
    expect(mockPush).toHaveBeenCalledWith('/es/blog/5/mi-post')
  })

  it('disconnects observer on unmount', () => {
    const { unmount } = renderApp(<PostStickyBar {...defaultProps} />)
    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('observes the sentinel element', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(mockObserve).toHaveBeenCalledWith(
      screen.getByTestId('sticky-bar-sentinel'),
    )
  })

  it('renders LanguageIcon', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(mockLanguageIcon.mock.calls[0][0]).toEqual(
      expect.objectContaining({ width: 16, height: 16, 'aria-hidden': 'true' }),
    )
  })

  it('renders divider between share section and nav buttons', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(screen.getByTestId('actions-divider')).toBeInTheDocument()
  })

  it('renders scroll top button', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(screen.getByTestId('scroll-top-button')).toBeInTheDocument()
  })

  it('scroll top button has correct aria-label', () => {
    renderApp(
      <PostStickyBar {...defaultProps} scrollTopAriaLabel="Go to top" />,
    )
    expect(screen.getByTestId('scroll-top-button')).toHaveAttribute(
      'aria-label',
      'Go to top',
    )
  })

  it('scroll top button uses default aria-label', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(screen.getByTestId('scroll-top-button')).toHaveAttribute(
      'aria-label',
      'Back to top',
    )
  })

  it('scroll top button click calls window.scrollTo', async () => {
    const mockScrollTo = jest.fn()
    window.scrollTo = mockScrollTo
    renderApp(<PostStickyBar {...defaultProps} />)
    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    await userEvent.click(screen.getByRole('button', { name: 'Back to top' }))
    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('renders ScrollTopIcon', () => {
    renderApp(<PostStickyBar {...defaultProps} />)
    expect(mockScrollTopIcon.mock.calls[0][0]).toEqual(
      expect.objectContaining({ width: 16, height: 16, 'aria-hidden': 'true' }),
    )
  })

  it('matches snapshot', () => {
    const { baseElement } = renderApp(<PostStickyBar {...defaultProps} />)
    expect(baseElement).toMatchSnapshot()
  })
})

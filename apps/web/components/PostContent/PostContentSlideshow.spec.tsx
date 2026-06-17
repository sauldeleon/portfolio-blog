import { fireEvent, screen } from '@testing-library/react'
import ReactDOM from 'react-dom'

import { renderWithTheme } from '@sdlgr/test-utils'

import { PostContentSlideshow } from './PostContentSlideshow'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'photoMeta.iso': 'ISO',
        'photoMeta.aperture': 'Aperture',
        'photoMeta.exposure': 'Exposure',
        'photoMeta.focalLength': 'Focal length',
        'photoMeta.panoramicCount': 'Panoramic shots',
      }
      return map[key] ?? key
    },
  }),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

jest.mock('react-dom', () => ({
  ...jest.requireActual<typeof ReactDOM>('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

jest.mock('./PostContent.styles', () => ({
  StyledCaption: ({ children }: { children: React.ReactNode }) => (
    <figcaption data-testid="slideshow-caption">{children}</figcaption>
  ),
  StyledModalOverlay: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <div data-testid="slideshow-image-modal" onClick={onClick}>
      {children}
    </div>
  ),
  StyledModalContent: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: (e: React.MouseEvent) => void
  }) => (
    <div data-testid="slideshow-modal-content" onClick={onClick}>
      {children}
    </div>
  ),
  StyledModalClose: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <button data-testid="slideshow-modal-close" onClick={onClick}>
      {children}
    </button>
  ),
  StyledModalDownload: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a data-testid="slideshow-modal-download" href={href}>
      {children}
    </a>
  ),
  StyledPhotoMeta: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="slideshow-photo-meta">{children}</div>
  ),
  StyledPhotoMetaItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="slideshow-photo-meta-item">{children}</div>
  ),
  StyledPhotoMetaLabel: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="slideshow-photo-meta-label">{children}</span>
  ),
}))

const singleSlide = JSON.stringify([{ src: '/img1.jpg', alt: '' }])

const twoSlides = JSON.stringify([
  { src: '/img1.jpg', alt: '' },
  { src: '/img2.jpg', alt: '' },
])

describe('PostContentSlideshow', () => {
  it('returns null on invalid JSON', () => {
    const { container } = renderWithTheme(
      <PostContentSlideshow slides="not-valid-json" />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('returns null on empty slides array', () => {
    const { container } = renderWithTheme(
      <PostContentSlideshow slides={JSON.stringify([])} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders slideshow with single slide', () => {
    renderWithTheme(<PostContentSlideshow slides={singleSlide} />)
    expect(screen.getByTestId('post-slideshow')).toBeInTheDocument()
  })

  it('shows counter "1 / 1" for single slide', () => {
    renderWithTheme(<PostContentSlideshow slides={singleSlide} />)
    expect(screen.getByTestId('slideshow-counter')).toHaveTextContent('1 / 1')
  })

  it('prev button is disabled for first slide', () => {
    renderWithTheme(<PostContentSlideshow slides={singleSlide} />)
    expect(screen.getByTestId('slideshow-prev')).toBeDisabled()
  })

  it('next button is disabled for last slide with single slide', () => {
    renderWithTheme(<PostContentSlideshow slides={singleSlide} />)
    expect(screen.getByTestId('slideshow-next')).toBeDisabled()
  })

  it('shows next button enabled with multiple slides', () => {
    renderWithTheme(<PostContentSlideshow slides={twoSlides} />)
    expect(screen.getByTestId('slideshow-next')).not.toBeDisabled()
  })

  it('clicking next advances to slide 2', () => {
    renderWithTheme(<PostContentSlideshow slides={twoSlides} />)
    fireEvent.click(screen.getByTestId('slideshow-next'))
    expect(screen.getByTestId('slideshow-counter')).toHaveTextContent('2 / 2')
  })

  it('clicking prev after next goes back to slide 1', () => {
    renderWithTheme(<PostContentSlideshow slides={twoSlides} />)
    fireEvent.click(screen.getByTestId('slideshow-next'))
    fireEvent.click(screen.getByTestId('slideshow-prev'))
    expect(screen.getByTestId('slideshow-counter')).toHaveTextContent('1 / 2')
  })

  it('shows caption at bottom by default', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([
          { src: '/img.jpg', alt: 'caption=My caption' },
        ])}
      />,
    )
    expect(screen.getByTestId('slideshow-caption')).toHaveTextContent(
      'My caption',
    )
  })

  it('shows caption at top when caption-pos=top', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([
          {
            src: '/img.jpg',
            alt: 'caption=Top caption&caption-pos=top',
          },
        ])}
      />,
    )
    expect(screen.getByTestId('slideshow-caption')).toHaveTextContent(
      'Top caption',
    )
  })

  it('shows photo meta section when photo-iso is present', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([{ src: '/img.jpg', alt: 'photo-iso=400' }])}
      />,
    )
    expect(screen.getByTestId('slideshow-photo-meta')).toBeInTheDocument()
  })

  it('shows iso, aperture, exposure, focal length and panoramic count values', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([
          {
            src: '/img.jpg',
            alt: 'photo-iso=400&photo-aperture=f/2.8&photo-exposure=1/250&photo-focal-length=50mm&photo-panoramic-count=3',
          },
        ])}
      />,
    )
    expect(screen.getByText('400')).toBeInTheDocument()
    expect(screen.getByText('f/2.8')).toBeInTheDocument()
    expect(screen.getByText('1/250')).toBeInTheDocument()
    expect(screen.getByText('50mm')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not show photo meta when no photo params', () => {
    renderWithTheme(<PostContentSlideshow slides={singleSlide} />)
    expect(screen.queryByTestId('slideshow-photo-meta')).not.toBeInTheDocument()
  })

  it('expand=true makes image wrapper clickable and clicking opens modal', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([
          { src: '/img.jpg', alt: 'expand=true&alt=expandable' },
        ])}
      />,
    )
    expect(
      screen.queryByTestId('slideshow-image-modal'),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('slideshow-image-wrapper'))
    expect(screen.getByTestId('slideshow-image-modal')).toBeInTheDocument()
  })

  it('modal has close button and clicking close closes it', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([
          { src: '/img.jpg', alt: 'expand=true&alt=expandable' },
        ])}
      />,
    )
    fireEvent.click(screen.getByTestId('slideshow-image-wrapper'))
    expect(screen.getByTestId('slideshow-modal-close')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('slideshow-modal-close'))
    expect(
      screen.queryByTestId('slideshow-image-modal'),
    ).not.toBeInTheDocument()
  })

  it('modal has download link', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([
          { src: '/img.jpg', alt: 'expand=true&alt=expandable' },
        ])}
      />,
    )
    fireEvent.click(screen.getByTestId('slideshow-image-wrapper'))
    expect(screen.getByTestId('slideshow-modal-download')).toHaveAttribute(
      'href',
      '/img.jpg',
    )
  })

  it('clicking image modal overlay closes it', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([
          { src: '/img.jpg', alt: 'expand=true&alt=expandable' },
        ])}
      />,
    )
    fireEvent.click(screen.getByTestId('slideshow-image-wrapper'))
    fireEvent.click(screen.getByTestId('slideshow-image-modal'))
    expect(
      screen.queryByTestId('slideshow-image-modal'),
    ).not.toBeInTheDocument()
  })

  it('expand=false: clicking image wrapper does not open modal', () => {
    renderWithTheme(<PostContentSlideshow slides={singleSlide} />)
    fireEvent.click(screen.getByTestId('slideshow-image-wrapper'))
    expect(
      screen.queryByTestId('slideshow-image-modal'),
    ).not.toBeInTheDocument()
  })

  it('alt text from alt= param is used', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([
          { src: '/img.jpg', alt: 'alt=My description' },
        ])}
      />,
    )
    expect(screen.getByAltText('My description')).toBeInTheDocument()
  })

  it('alt text falls back to full alt string when no = in it', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([{ src: '/img.jpg', alt: 'plain alt text' }])}
      />,
    )
    expect(screen.getByAltText('plain alt text')).toBeInTheDocument()
  })

  it('alt is empty string when options exist but no alt= key', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([{ src: '/img.jpg', alt: 'caption=foo' }])}
      />,
    )
    expect(screen.getByAltText('')).toBeInTheDocument()
  })

  it('alt is empty string when alt field is absent from slide', () => {
    renderWithTheme(
      <PostContentSlideshow slides={JSON.stringify([{ src: '/img.jpg' }])} />,
    )
    expect(screen.getByAltText('')).toBeInTheDocument()
  })

  it('shows caption inside modal when caption and expand are set', () => {
    renderWithTheme(
      <PostContentSlideshow
        slides={JSON.stringify([
          {
            src: '/img.jpg',
            alt: 'expand=true&caption=Modal caption&alt=img',
          },
        ])}
      />,
    )
    fireEvent.click(screen.getByTestId('slideshow-image-wrapper'))
    const captions = screen.getAllByTestId('slideshow-caption')
    const captionTexts = captions.map((c) => c.textContent)
    expect(captionTexts).toContain('Modal caption')
  })
})

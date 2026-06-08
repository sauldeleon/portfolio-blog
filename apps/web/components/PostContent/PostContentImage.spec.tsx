import { fireEvent, render, screen } from '@testing-library/react'

import { PostContentImage } from './PostContentImage'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'photoMeta.iso': 'ISO',
        'photoMeta.aperture': 'Aperture',
        'photoMeta.exposure': 'Exposure',
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

jest.mock('./PostContent.styles', () => ({
  StyledImageWrapper: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <div data-testid="post-image-wrapper" onClick={onClick}>
      {children}
    </div>
  ),
  StyledCaption: ({ children }: { children: React.ReactNode }) => (
    <figcaption data-testid="post-image-caption">{children}</figcaption>
  ),
  StyledModalOverlay: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <div data-testid="post-image-modal" onClick={onClick}>
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
    <div data-testid="post-modal-content" onClick={onClick}>
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
    <button data-testid="post-modal-close" onClick={onClick}>
      {children}
    </button>
  ),
  StyledModalCaption: ({ children }: { children: React.ReactNode }) => (
    <figcaption data-testid="post-modal-caption">{children}</figcaption>
  ),
  StyledModalDownload: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a data-testid="post-modal-download" href={href}>
      {children}
    </a>
  ),
  StyledPhotoMeta: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="post-photo-meta">{children}</div>
  ),
  StyledPhotoMetaItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="post-photo-meta-item">{children}</div>
  ),
  StyledPhotoMetaLabel: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="post-photo-meta-label">{children}</span>
  ),
}))

describe('PostContentImage', () => {
  it('returns null when src is not provided', () => {
    const { container } = render(<PostContentImage />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders image with plain alt text', () => {
    render(<PostContentImage src="/img.jpg" alt="A simple image" />)
    expect(screen.getByAltText('A simple image')).toBeInTheDocument()
  })

  it('parses alt as URLSearchParams when it contains "="', () => {
    render(
      <PostContentImage
        src="/img.jpg"
        alt="alt=My image description&size=small"
      />,
    )
    expect(screen.getByAltText('My image description')).toBeInTheDocument()
  })

  it('uses empty string as alt when options exist but no alt param', () => {
    render(<PostContentImage src="/img.jpg" alt="size=small" />)
    expect(screen.getByAltText('')).toBeInTheDocument()
  })

  it('renders caption below image by default', () => {
    render(
      <PostContentImage src="/img.jpg" alt="caption=My Caption&alt=desc" />,
    )
    const captions = screen.getAllByTestId('post-image-caption')
    expect(captions).toHaveLength(1)
    expect(captions[0]).toHaveTextContent('My Caption')
  })

  it('renders caption above image when caption-pos=top', () => {
    render(
      <PostContentImage
        src="/img.jpg"
        alt="caption=Top Caption&caption-pos=top&alt=desc"
      />,
    )
    expect(screen.getByTestId('post-image-caption')).toHaveTextContent(
      'Top Caption',
    )
  })

  it('does not render caption when not specified', () => {
    render(<PostContentImage src="/img.jpg" alt="A plain alt" />)
    expect(screen.queryByTestId('post-image-caption')).not.toBeInTheDocument()
  })

  it('does not render modal when expandable but not clicked', () => {
    render(<PostContentImage src="/img.jpg" alt="expand=true&alt=expandable" />)
    expect(screen.queryByTestId('post-image-modal')).not.toBeInTheDocument()
  })

  it('opens modal when expandable image is clicked', () => {
    render(<PostContentImage src="/img.jpg" alt="expand=true&alt=expandable" />)
    fireEvent.click(screen.getByTestId('post-image-wrapper'))
    expect(screen.getByTestId('post-image-modal')).toBeInTheDocument()
  })

  it('closes modal when overlay is clicked', () => {
    render(<PostContentImage src="/img.jpg" alt="expand=true&alt=expandable" />)
    fireEvent.click(screen.getByTestId('post-image-wrapper'))
    expect(screen.getByTestId('post-image-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('post-image-modal'))
    expect(screen.queryByTestId('post-image-modal')).not.toBeInTheDocument()
  })

  it('closes modal when close button is clicked', () => {
    render(<PostContentImage src="/img.jpg" alt="expand=true&alt=expandable" />)
    fireEvent.click(screen.getByTestId('post-image-wrapper'))
    fireEvent.click(screen.getByTestId('post-modal-close'))
    expect(screen.queryByTestId('post-image-modal')).not.toBeInTheDocument()
  })

  it('does not close modal when modal content is clicked', () => {
    render(<PostContentImage src="/img.jpg" alt="expand=true&alt=expandable" />)
    fireEvent.click(screen.getByTestId('post-image-wrapper'))
    fireEvent.click(screen.getByTestId('post-modal-content'))
    expect(screen.getByTestId('post-image-modal')).toBeInTheDocument()
  })

  it('shows caption in modal when caption provided', () => {
    render(
      <PostContentImage
        src="/img.jpg"
        alt="expand=true&caption=Modal caption&alt=img"
      />,
    )
    fireEvent.click(screen.getByTestId('post-image-wrapper'))
    expect(screen.getByTestId('post-modal-caption')).toHaveTextContent(
      'Modal caption',
    )
  })

  it('renders download link in modal', () => {
    render(<PostContentImage src="/img.jpg" alt="expand=true&alt=expandable" />)
    fireEvent.click(screen.getByTestId('post-image-wrapper'))
    expect(screen.getByTestId('post-modal-download')).toHaveAttribute(
      'href',
      '/img.jpg',
    )
  })

  it('does not render modal for non-expandable image', () => {
    render(<PostContentImage src="/img.jpg" alt="Just an image" />)
    fireEvent.click(screen.getByTestId('post-image-wrapper'))
    expect(screen.queryByTestId('post-image-modal')).not.toBeInTheDocument()
  })

  it('renders with no alt when alt prop is omitted', () => {
    render(<PostContentImage src="/img.jpg" />)
    expect(screen.getByAltText('')).toBeInTheDocument()
  })

  it('uses medium size when size=medium is specified', () => {
    render(<PostContentImage src="/img.jpg" alt="size=medium&alt=desc" />)
    expect(screen.getByAltText('desc')).toBeInTheDocument()
    expect(screen.getByTestId('post-image-wrapper')).toBeInTheDocument()
  })

  it('does not render photo meta strip when no photo meta params', () => {
    render(<PostContentImage src="/img.jpg" alt="alt=desc" />)
    expect(screen.queryByTestId('post-photo-meta')).not.toBeInTheDocument()
  })

  it('renders photo meta strip when photo-iso is present', () => {
    render(<PostContentImage src="/img.jpg" alt="photo-iso=400" />)
    expect(screen.getByTestId('post-photo-meta')).toBeInTheDocument()
    expect(screen.getByText('400')).toBeInTheDocument()
  })

  it('renders photo meta strip when photo-aperture is present', () => {
    render(<PostContentImage src="/img.jpg" alt="photo-aperture=f/2.8" />)
    expect(screen.getByTestId('post-photo-meta')).toBeInTheDocument()
    expect(screen.getByText('f/2.8')).toBeInTheDocument()
  })

  it('renders photo meta strip when photo-exposure is present', () => {
    render(<PostContentImage src="/img.jpg" alt="photo-exposure=1/250" />)
    expect(screen.getByTestId('post-photo-meta')).toBeInTheDocument()
    expect(screen.getByText('1/250')).toBeInTheDocument()
  })

  it('renders all photo meta items when all params provided', () => {
    render(
      <PostContentImage
        src="/img.jpg"
        alt="photo-iso=800&photo-aperture=f/4&photo-exposure=1/500"
      />,
    )
    expect(screen.getByTestId('post-photo-meta')).toBeInTheDocument()
    expect(screen.getByText('800')).toBeInTheDocument()
    expect(screen.getByText('f/4')).toBeInTheDocument()
    expect(screen.getByText('1/500')).toBeInTheDocument()
  })

  it('renders photo meta labels', () => {
    render(
      <PostContentImage
        src="/img.jpg"
        alt="photo-iso=100&photo-aperture=f/1.8&photo-exposure=1/125"
      />,
    )
    const labels = screen.getAllByTestId('post-photo-meta-label')
    expect(labels).toHaveLength(3)
    expect(labels[0]).toHaveTextContent('ISO')
    expect(labels[1]).toHaveTextContent('Aperture')
    expect(labels[2]).toHaveTextContent('Exposure')
  })

  it('renders photo meta strip above caption when both present', () => {
    render(
      <PostContentImage
        src="/img.jpg"
        alt="photo-iso=200&caption=My shot&alt=desc"
      />,
    )
    expect(screen.getByTestId('post-photo-meta')).toBeInTheDocument()
    expect(screen.getByTestId('post-image-caption')).toBeInTheDocument()
  })

  it('renders only present photo meta items', () => {
    render(
      <PostContentImage
        src="/img.jpg"
        alt="photo-iso=100&photo-aperture=f/2"
      />,
    )
    const items = screen.getAllByTestId('post-photo-meta-item')
    expect(items).toHaveLength(2)
  })
})

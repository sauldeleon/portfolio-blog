import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import { ImageCard } from './ImageCard'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt: string
    [key: string]: unknown
  }) => <img src={src} alt={alt} {...props} />,
}))

jest.mock('@sdlgr/button', () => ({
  Button: ({
    children,
    onClick,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    onClick?: () => void
    'data-testid'?: string
  }) => (
    <button type="button" onClick={onClick} data-testid={testId}>
      {children}
    </button>
  ),
}))

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'images.copyUrl': 'Copy URL',
        'images.copied': 'Copied!',
        'images.rename': 'Rename',
        'images.delete': 'Delete',
      }
      return translations[key] ?? key
    },
  }),
}))

const mockImage: CloudinaryImage = {
  publicId: 'sawl.dev - blog/my-photo',
  url: 'https://res.cloudinary.com/demo/image/upload/my-photo.jpg',
  width: 800,
  height: 600,
  format: 'jpg',
  createdAt: '2024-06-15T00:00:00Z',
  bytes: 1536000,
}

const mockOnDelete = jest.fn()
const mockOnEdit = jest.fn()

describe('ImageCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      writable: true,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders card with testid', () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    expect(screen.getByTestId('image-card')).toBeInTheDocument()
  })

  it('renders thumbnail image', () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    const img = screen.getByTestId('image-thumbnail')
    expect(img).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/demo/image/upload/my-photo.jpg',
    )
    expect(img).toHaveAttribute('alt', '')
  })

  it('shows filename extracted from publicId', () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    expect(screen.getByText('my-photo')).toBeInTheDocument()
  })

  it('shows dimensions', () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    expect(screen.getByText('800x600')).toBeInTheDocument()
  })

  it('shows formatted size in MB', () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    expect(screen.getByText('1.5 MB')).toBeInTheDocument()
  })

  it('shows formatted size in KB when under 1 MB', () => {
    const smallImage: CloudinaryImage = { ...mockImage, bytes: 51200 }
    renderApp(
      <ImageCard
        image={smallImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    expect(screen.getByText('50.0 KB')).toBeInTheDocument()
  })

  it('shows formatted upload date', () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    expect(screen.getByText(/15 Jun 2024/)).toBeInTheDocument()
  })

  it('renders copy URL button', () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    expect(screen.getByTestId('copy-url-button')).toHaveTextContent('Copy URL')
  })

  it('copies URL to clipboard on copy button click', async () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    fireEvent.click(screen.getByTestId('copy-url-button'))
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockImage.url),
    )
  })

  it('shows "Copied!" feedback for 2 seconds after copying', async () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    fireEvent.click(screen.getByTestId('copy-url-button'))
    await waitFor(() =>
      expect(screen.getByTestId('copy-url-button')).toHaveTextContent(
        'Copied!',
      ),
    )
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    await waitFor(() =>
      expect(screen.getByTestId('copy-url-button')).toHaveTextContent(
        'Copy URL',
      ),
    )
  })

  it('renders rename button', () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    expect(screen.getByTestId('edit-button')).toHaveTextContent('Rename')
  })

  it('calls onEdit with publicId when rename button clicked', () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    fireEvent.click(screen.getByTestId('edit-button'))
    expect(mockOnEdit).toHaveBeenCalledWith('sawl.dev - blog/my-photo')
  })

  it('calls onDelete with publicId when delete button clicked', () => {
    renderApp(
      <ImageCard
        image={mockImage}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    fireEvent.click(screen.getByTestId('delete-button'))
    expect(mockOnDelete).toHaveBeenCalledWith('sawl.dev - blog/my-photo')
  })

  it('uses publicId itself as filename when no slash present', () => {
    const imageNoSlash: CloudinaryImage = { ...mockImage, publicId: 'noslash' }
    renderApp(
      <ImageCard
        image={imageNoSlash}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    )
    expect(screen.getByText('noslash')).toBeInTheDocument()
  })
})

export {}

import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import axios from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { ImagePicker } from './ImagePicker'

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

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'images.picker.title': 'Insert Image',
        'images.picker.search': 'Search images…',
        'images.picker.empty': 'No images found.',
        'images.picker.loading': 'Loading…',
      }
      return translations[key] ?? key
    },
  }),
}))

const mockImages = [
  {
    publicId: 'sawl.dev - blog/mountain',
    url: 'https://res.cloudinary.com/demo/mountain.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: '2024-01-01T00:00:00Z',
    bytes: 12345,
  },
  {
    publicId: 'sawl.dev - blog/city',
    url: 'https://res.cloudinary.com/demo/city.jpg',
    width: 400,
    height: 300,
    format: 'jpg',
    createdAt: '2024-01-02T00:00:00Z',
    bytes: 9876,
  },
]

const mockImagesPage2 = [
  {
    publicId: 'sawl.dev - blog/forest',
    url: 'https://res.cloudinary.com/demo/forest.jpg',
    width: 1200,
    height: 800,
    format: 'jpg',
    createdAt: '2024-01-03T00:00:00Z',
    bytes: 20000,
  },
]

const mockImageBytes = (bytes: number) => [
  {
    publicId: 'sawl.dev - blog/test',
    url: 'https://res.cloudinary.com/demo/test.jpg',
    width: 100,
    height: 100,
    format: 'jpg',
    createdAt: '2024-01-01T00:00:00Z',
    bytes,
  },
]

const mockOnClose = jest.fn()
const mockOnPick = jest.fn()

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

describe('ImagePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .spyOn(axios, 'get')
      .mockResolvedValue({
        data: { images: mockImages, nextCursor: undefined },
      })
  })

  it('sidebar has correct transform when open', async () => {
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.queryByTestId('picker-loading')).not.toBeInTheDocument(),
    )
    const sidebar = screen.getByTestId('image-picker-sidebar')
    expect(sidebar).toBeInTheDocument()
  })

  it('shows images when open', async () => {
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )
  })

  it('shows loading state while fetching', () => {
    jest.spyOn(axios, 'get').mockReturnValue(new Promise(jest.fn()))
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(screen.getByTestId('picker-loading')).toBeInTheDocument()
  })

  it('shows empty state when no images match search', async () => {
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )
    fireEvent.change(screen.getByTestId('image-picker-search'), {
      target: { value: 'zzznomatch' },
    })
    expect(screen.getByTestId('picker-empty')).toBeInTheDocument()
  })

  it('filters images by search term', async () => {
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )
    fireEvent.change(screen.getByTestId('image-picker-search'), {
      target: { value: 'mountain' },
    })
    expect(screen.getAllByTestId('image-picker-item')).toHaveLength(1)
  })

  it('calls onPick with image object when image clicked', async () => {
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )
    fireEvent.click(screen.getAllByTestId('image-picker-item')[0])
    expect(mockOnPick).toHaveBeenCalledWith(mockImages[0])
  })

  it('calls onClose when close button clicked', async () => {
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.queryByTestId('picker-loading')).not.toBeInTheDocument(),
    )
    fireEvent.click(screen.getByTestId('image-picker-close'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows empty state when fetch returns no images', async () => {
    jest
      .spyOn(axios, 'get')
      .mockResolvedValue({ data: { images: [], nextCursor: undefined } })
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(await screen.findByTestId('picker-empty')).toBeInTheDocument()
  })

  it('shows empty state when fetch fails', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('Network error'))
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(await screen.findByTestId('picker-empty')).toBeInTheDocument()
  })

  it('is rendered with closed state (transform applied via prop)', () => {
    renderApp(
      <ImagePicker open={false} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(screen.getByTestId('image-picker-sidebar')).toBeInTheDocument()
  })

  it('shows image name extracted from publicId', async () => {
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )
    const names = screen.getAllByTestId('image-name')
    expect(names[0]).toHaveTextContent('mountain')
    expect(names[0]).toHaveAttribute('title', 'mountain')
    expect(names[1]).toHaveTextContent('city')
    expect(names[1]).toHaveAttribute('title', 'city')
  })

  it('shows image dimensions in metadata', async () => {
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )
    expect(screen.getByText('800×600')).toBeInTheDocument()
    expect(screen.getByText('400×300')).toBeInTheDocument()
  })

  it('formats bytes as KB when between 1024 and 1MB', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: { images: mockImageBytes(12345), nextCursor: undefined },
    })
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(await screen.findByTestId('image-picker-item')).toBeInTheDocument()
    expect(screen.getByText('12.1 KB')).toBeInTheDocument()
  })

  it('formats bytes as B when under 1024', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: { images: mockImageBytes(512), nextCursor: undefined },
    })
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(await screen.findByTestId('image-picker-item')).toBeInTheDocument()
    expect(screen.getByText('512 B')).toBeInTheDocument()
  })

  it('formats bytes as MB when over 1MB', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: { images: mockImageBytes(2097152), nextCursor: undefined },
    })
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(await screen.findByTestId('image-picker-item')).toBeInTheDocument()
    expect(screen.getByText('2.0 MB')).toBeInTheDocument()
  })

  it('renders scroll sentinel element', async () => {
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.queryByTestId('picker-loading')).not.toBeInTheDocument(),
    )
    expect(screen.getByTestId('scroll-sentinel')).toBeInTheDocument()
  })

  it('loads more images when sentinel intersects and nextCursor exists', async () => {
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: 'cursor-abc' },
      })
      .mockResolvedValueOnce({
        data: { images: mockImagesPage2, nextCursor: undefined },
      })

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    await act(async () => {
      observerCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      )
    })

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(3),
    )

    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      '/api/images/?cursor=cursor-abc',
    )
  })

  it('does not load more when nextCursor is undefined', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      data: { images: mockImages, nextCursor: undefined },
    })

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    await act(async () => {
      observerCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      )
    })

    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  it('does not load more when sentinel is not intersecting', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      data: { images: mockImages, nextCursor: 'cursor-xyz' },
    })

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    await act(async () => {
      observerCallback(
        [{ isIntersecting: false }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      )
    })

    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  it('shows load-more-loading indicator while loading next page', async () => {
    let resolveSecond: (value: unknown) => void
    const secondCall = new Promise((resolve) => {
      resolveSecond = resolve
    })

    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: 'cursor-abc' },
      })
      .mockReturnValueOnce(secondCall as ReturnType<typeof axios.get>)

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    act(() => {
      observerCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      )
    })

    expect(await screen.findByTestId('load-more-loading')).toBeInTheDocument()

    await act(async () => {
      resolveSecond!({
        data: { images: mockImagesPage2, nextCursor: undefined },
      })
    })

    await waitFor(() =>
      expect(screen.queryByTestId('load-more-loading')).not.toBeInTheDocument(),
    )
  })

  it('appends new images to existing images after load more', async () => {
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: 'cursor-abc' },
      })
      .mockResolvedValueOnce({
        data: { images: mockImagesPage2, nextCursor: undefined },
      })

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    await act(async () => {
      observerCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      )
    })

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(3),
    )

    expect(
      screen.getAllByTestId('image-name').map((el) => el.getAttribute('title')),
    ).toContain('forest')
  })

  it('disconnects IntersectionObserver on unmount', async () => {
    const { unmount } = renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.queryByTestId('picker-loading')).not.toBeInTheDocument(),
    )
    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('silently ignores load more errors', async () => {
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: 'cursor-abc' },
      })
      .mockRejectedValueOnce(new Error('Network error'))

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    await act(async () => {
      observerCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      )
    })

    await waitFor(() =>
      expect(screen.queryByTestId('load-more-loading')).not.toBeInTheDocument(),
    )
    expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2)
  })

  it('does not load more when already loading more', async () => {
    let resolveSecond: (value: unknown) => void
    const secondCall = new Promise((resolve) => {
      resolveSecond = resolve
    })

    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: 'cursor-abc' },
      })
      .mockReturnValueOnce(secondCall as ReturnType<typeof axios.get>)

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    act(() => {
      observerCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      )
    })

    expect(await screen.findByTestId('load-more-loading')).toBeInTheDocument()

    act(() => {
      observerCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      )
    })

    await act(async () => {
      resolveSecond!({
        data: { images: mockImagesPage2, nextCursor: undefined },
      })
    })

    await waitFor(() =>
      expect(screen.queryByTestId('load-more-loading')).not.toBeInTheDocument(),
    )
    expect(axios.get).toHaveBeenCalledTimes(2)
  })
})

export {}

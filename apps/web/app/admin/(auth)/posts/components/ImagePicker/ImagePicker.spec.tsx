import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import { useState } from 'react'

import { renderApp } from '@sdlgr/test-utils'

import { ImagePicker } from './ImagePicker'

vi.mock('next/image', () => ({
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

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: vi.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'images.picker.title': 'Insert Image',
        'images.picker.search': 'Search images…',
        'images.picker.empty': 'No images found.',
        'images.picker.loading': 'Loading…',
        'images.upload.dropzone': 'Drop an image here, or click to select',
        'images.upload.dropzoneActive': 'Drop it!',
        'images.upload.uploading': 'Uploading…',
        'images.upload.error': 'Upload failed, please try again',
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
    createdAt: '2024-01-02T00:00:00Z',
    bytes: 12345,
  },
  {
    publicId: 'sawl.dev - blog/city',
    url: 'https://res.cloudinary.com/demo/city.jpg',
    width: 400,
    height: 300,
    format: 'jpg',
    createdAt: '2024-01-01T00:00:00Z',
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

const mockOnClose = vi.fn()
const mockOnPick = vi.fn()

let observerCallback: IntersectionObserverCallback
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

beforeAll(() => {
  global.IntersectionObserver = vi.fn(function (cb) {
    observerCallback = cb
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    }
  }) as unknown as typeof IntersectionObserver
})

async function dropUploadFiles(files: File[]) {
  fireEvent.drop(screen.getByTestId('upload-dropzone'), {
    dataTransfer: { files },
  })
  await act(async () => undefined)
}

async function changeUploadInput(input: HTMLInputElement) {
  fireEvent.change(input)
  await act(async () => undefined)
}

describe('ImagePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(axios, 'get').mockResolvedValue({
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
    vi.spyOn(axios, 'get').mockReturnValue(new Promise(vi.fn()))
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(screen.getByTestId('picker-loading')).toBeInTheDocument()
  })

  it('shows empty state when API search returns no results', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: undefined },
      })
      .mockResolvedValueOnce({ data: { images: [], nextCursor: undefined } })

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    vi.useFakeTimers()
    fireEvent.change(screen.getByTestId('image-picker-search'), {
      target: { value: 'zzznomatch' },
    })
    act(() => vi.advanceTimersByTime(300))
    vi.useRealTimers()

    expect(await screen.findByTestId('picker-empty')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalledWith('/api/images/?search=zzznomatch')
  })

  it('calls API with search term after debounce', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: undefined },
      })
      .mockResolvedValueOnce({
        data: { images: [mockImages[0]], nextCursor: undefined },
      })

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    vi.useFakeTimers()
    fireEvent.change(screen.getByTestId('image-picker-search'), {
      target: { value: 'mountain' },
    })
    expect(axios.get).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(300))
    vi.useRealTimers()

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(1),
    )
    expect(axios.get).toHaveBeenCalledWith('/api/images/?search=mountain')
  })

  it('clears previous debounce timer when user types again before it fires', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: undefined },
      })
      .mockResolvedValueOnce({
        data: { images: [mockImages[0]], nextCursor: undefined },
      })

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    vi.useFakeTimers()
    fireEvent.change(screen.getByTestId('image-picker-search'), {
      target: { value: 'mo' },
    })
    fireEvent.change(screen.getByTestId('image-picker-search'), {
      target: { value: 'mountain' },
    })
    act(() => vi.advanceTimersByTime(300))
    vi.useRealTimers()

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(1),
    )
    expect(axios.get).toHaveBeenCalledTimes(2)
    expect(axios.get).toHaveBeenLastCalledWith('/api/images/?search=mountain')
  })

  it('clears pending debounce timer when picker reopens', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: undefined },
      })
      .mockResolvedValueOnce({
        data: { images: [mockImages[0]], nextCursor: undefined },
      })

    function PickerWithToggle() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button
            data-testid="toggle-picker2"
            onClick={() => setOpen((o) => !o)}
          />
          <ImagePicker open={open} onClose={mockOnClose} onPick={mockOnPick} />
        </>
      )
    }

    renderApp(<PickerWithToggle />)
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    vi.useFakeTimers()
    fireEvent.change(screen.getByTestId('image-picker-search'), {
      target: { value: 'mountain' },
    })
    fireEvent.click(screen.getByTestId('toggle-picker2'))
    vi.useRealTimers()

    fireEvent.click(screen.getByTestId('toggle-picker2'))

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(1),
    )
    expect(axios.get).toHaveBeenCalledWith('/api/images/?search=mountain')
  })

  it('calls fetchImages when search is cleared', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: undefined },
      })
      .mockResolvedValueOnce({
        data: { images: [mockImages[0]], nextCursor: undefined },
      })
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: undefined },
      })

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )

    vi.useFakeTimers()
    fireEvent.change(screen.getByTestId('image-picker-search'), {
      target: { value: 'mountain' },
    })
    act(() => vi.advanceTimersByTime(300))
    vi.useRealTimers()

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(1),
    )

    vi.useFakeTimers()
    fireEvent.change(screen.getByTestId('image-picker-search'), {
      target: { value: '' },
    })
    act(() => vi.advanceTimersByTime(300))
    vi.useRealTimers()

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )
    expect(axios.get).toHaveBeenLastCalledWith('/api/images/')
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
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: { images: [], nextCursor: undefined },
    })
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(await screen.findByTestId('picker-empty')).toBeInTheDocument()
  })

  it('shows empty state when fetch fails', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network error'))
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
    expect(axios.get).not.toHaveBeenCalled()
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
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: { images: mockImageBytes(12345), nextCursor: undefined },
    })
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(await screen.findByTestId('image-picker-item')).toBeInTheDocument()
    expect(screen.getByText('12.1 KB')).toBeInTheDocument()
  })

  it('formats bytes as B when under 1024', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: { images: mockImageBytes(512), nextCursor: undefined },
    })
    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )
    expect(await screen.findByTestId('image-picker-item')).toBeInTheDocument()
    expect(screen.getByText('512 B')).toBeInTheDocument()
  })

  it('formats bytes as MB when over 1MB', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
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
    vi.spyOn(axios, 'get')
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
    vi.spyOn(axios, 'get').mockResolvedValueOnce({
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
    vi.spyOn(axios, 'get').mockResolvedValueOnce({
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
    let resolveSecond: (value: unknown) => void = () => {
      throw new Error('Second page resolver was not initialized')
    }
    const secondCall = new Promise((resolve) => {
      resolveSecond = resolve
    })

    vi.spyOn(axios, 'get')
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
      resolveSecond({
        data: { images: mockImagesPage2, nextCursor: undefined },
      })
    })

    await waitFor(() =>
      expect(screen.queryByTestId('load-more-loading')).not.toBeInTheDocument(),
    )
  })

  it('appends new images to existing images after load more', async () => {
    vi.spyOn(axios, 'get')
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

  it('does not add duplicate images when load more returns already-loaded items', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: 'cursor-abc' },
      })
      .mockResolvedValueOnce({
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

    await waitFor(() =>
      expect(screen.queryByTestId('load-more-loading')).not.toBeInTheDocument(),
    )

    expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2)
  })

  it('resets image list when picker is reopened to avoid stale duplicates', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: 'cursor-abc' },
      })
      .mockResolvedValueOnce({
        data: { images: mockImagesPage2, nextCursor: undefined },
      })
      .mockResolvedValueOnce({
        data: { images: mockImages, nextCursor: undefined },
      })

    function PickerWithToggle() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button
            data-testid="toggle-picker"
            onClick={() => setOpen((o) => !o)}
          />
          <ImagePicker open={open} onClose={mockOnClose} onPick={mockOnPick} />
        </>
      )
    }

    renderApp(<PickerWithToggle />)

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

    fireEvent.click(screen.getByTestId('toggle-picker'))
    fireEvent.click(screen.getByTestId('toggle-picker'))

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )
  })

  it('deduplicates images with the same publicId in the display list', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: {
        images: [mockImages[0], mockImages[1], mockImages[0]],
        nextCursor: undefined,
      },
    })

    renderApp(
      <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
    )
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
    vi.spyOn(axios, 'get')
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

  describe('upload', () => {
    const uploadedImage = {
      publicId: 'sawl.dev - blog/new-image',
      url: 'https://res.cloudinary.com/demo/new.jpg',
      width: 600,
      height: 400,
      format: 'jpg',
      createdAt: '2024-01-10T00:00:00Z',
      bytes: 5000,
    }

    it('renders upload dropzone with default text', async () => {
      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.queryByTestId('picker-loading')).not.toBeInTheDocument(),
      )
      expect(screen.getByTestId('upload-dropzone')).toHaveTextContent(
        'Drop an image here, or click to select',
      )
    })

    it('shows active text on drag over', async () => {
      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.queryByTestId('picker-loading')).not.toBeInTheDocument(),
      )
      fireEvent.dragOver(screen.getByTestId('upload-dropzone'))
      expect(screen.getByTestId('upload-dropzone')).toHaveTextContent(
        'Drop it!',
      )
    })

    it('resets text on drag leave', async () => {
      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.queryByTestId('picker-loading')).not.toBeInTheDocument(),
      )
      fireEvent.dragOver(screen.getByTestId('upload-dropzone'))
      fireEvent.dragLeave(screen.getByTestId('upload-dropzone'))
      expect(screen.getByTestId('upload-dropzone')).toHaveTextContent(
        'Drop an image here, or click to select',
      )
    })

    it('shows uploading text while upload is in progress', async () => {
      let resolveUpload: (value: unknown) => void = () => {
        throw new Error('Upload resolver was not initialized')
      }
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve
      })
      vi.spyOn(axios, 'post').mockReturnValue(
        uploadPromise as ReturnType<typeof axios.post>,
      )

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
      )

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      await dropUploadFiles([file])

      expect(screen.getByTestId('upload-dropzone')).toHaveTextContent(
        'Uploading…',
      )

      await act(async () => {
        resolveUpload({ data: uploadedImage })
      })
      await waitFor(() =>
        expect(screen.getByTestId('upload-dropzone')).not.toHaveTextContent(
          'Uploading…',
        ),
      )
    })

    it('prepends uploaded image immediately before background refresh', async () => {
      let resolveGet: (value: unknown) => void = () => {
        throw new Error('Background refresh resolver was not initialized')
      }
      const getPromise = new Promise((resolve) => {
        resolveGet = resolve
      })
      vi.spyOn(axios, 'post').mockResolvedValue({ data: uploadedImage })
      vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({
          data: { images: mockImages, nextCursor: undefined },
        })
        .mockReturnValueOnce(getPromise as ReturnType<typeof axios.get>)

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
      )

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      await dropUploadFiles([file])

      // Image is prepended from upload, before background GET resolves
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(3),
      )
      expect(screen.getAllByTestId('image-name')[0]).toHaveTextContent(
        'new-image',
      )

      await act(async () => {
        resolveGet({ data: { images: mockImages, nextCursor: undefined } })
      })
    })

    it('pins uploaded image at top when server refresh includes it', async () => {
      // Server returns uploaded image mid-list (alphabetical sort); it should stay at top
      const serverListWithUploadedMid = [...mockImages, uploadedImage]
      vi.spyOn(axios, 'post').mockResolvedValue({ data: uploadedImage })
      vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({
          data: { images: mockImages, nextCursor: undefined },
        })
        .mockResolvedValueOnce({
          data: { images: serverListWithUploadedMid, nextCursor: undefined },
        })

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
      )

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      await dropUploadFiles([file])

      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(3),
      )
      expect(screen.getAllByTestId('image-name')[0]).toHaveTextContent(
        'new-image',
      )
    })

    it('keeps uploaded image at top when server has not indexed it yet', async () => {
      vi.spyOn(axios, 'post').mockResolvedValue({ data: uploadedImage })
      vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({
          data: { images: mockImages, nextCursor: undefined },
        })
        .mockResolvedValueOnce({
          data: { images: mockImages, nextCursor: undefined },
        })

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
      )

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      await dropUploadFiles([file])

      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(3),
      )
      expect(screen.getAllByTestId('image-name')[0]).toHaveTextContent(
        'new-image',
      )
    })

    it('preserves uploaded image when initial fetch resolves after upload', async () => {
      let resolveInitialGet: (value: unknown) => void = () => {
        throw new Error('Initial image fetch resolver was not initialized')
      }
      const initialGetPromise = new Promise((resolve) => {
        resolveInitialGet = resolve
      })
      vi.spyOn(axios, 'post').mockResolvedValue({ data: uploadedImage })
      vi.spyOn(axios, 'get')
        .mockReturnValueOnce(initialGetPromise as ReturnType<typeof axios.get>)
        .mockResolvedValueOnce({
          data: { images: mockImages, nextCursor: undefined },
        })

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )

      expect(screen.getByTestId('picker-loading')).toBeInTheDocument()

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      await dropUploadFiles([file])

      // Resolve initial GET after upload to trigger the race condition
      await act(async () => {
        resolveInitialGet({
          data: { images: mockImages, nextCursor: undefined },
        })
      })

      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(3),
      )
      expect(screen.getAllByTestId('image-name')[0]).toHaveTextContent(
        'new-image',
      )
    })

    it('keeps uploaded image when background refresh fails', async () => {
      vi.spyOn(axios, 'post').mockResolvedValue({ data: uploadedImage })
      vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({
          data: { images: mockImages, nextCursor: undefined },
        })
        .mockRejectedValueOnce(new Error('network error'))

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
      )

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      await dropUploadFiles([file])

      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(3),
      )
      expect(screen.getAllByTestId('image-name')[0]).toHaveTextContent(
        'new-image',
      )
    })

    it('shows upload error on failure', async () => {
      vi.spyOn(axios, 'post').mockRejectedValue(new Error('Upload failed'))

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
      )

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      await dropUploadFiles([file])

      expect(await screen.findByTestId('upload-error')).toHaveTextContent(
        'Upload failed, please try again',
      )
    })

    it('clears upload error on subsequent upload attempt', async () => {
      vi.spyOn(axios, 'post')
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ data: uploadedImage })

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
      )

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      await dropUploadFiles([file])
      await screen.findByTestId('upload-error')

      await dropUploadFiles([file])
      await waitFor(() =>
        expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument(),
      )
    })

    it('sends filename without extension as name in FormData', async () => {
      let capturedFormData: FormData | undefined
      vi.spyOn(axios, 'post').mockImplementation(function (_, data) {
        capturedFormData = data as FormData
        return Promise.resolve({ data: uploadedImage })
      })

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
      )

      const file = new File(['content'], 'my-photo.jpg', { type: 'image/jpeg' })
      await dropUploadFiles([file])

      expect(capturedFormData?.get('name')).toBe('my-photo')
    })

    it('does not upload when drop has no file', async () => {
      const postSpy = vi.spyOn(axios, 'post')

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
      )

      await dropUploadFiles([])

      expect(postSpy).not.toHaveBeenCalled()
    })

    it('prepends uploaded image via file input', async () => {
      vi.spyOn(axios, 'post').mockResolvedValue({ data: uploadedImage })

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(2),
      )

      const file = new File(['content'], 'new.jpg', { type: 'image/jpeg' })
      const input = screen.getByTestId('upload-file-input') as HTMLInputElement
      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      })
      await changeUploadInput(input)

      await waitFor(() =>
        expect(screen.getAllByTestId('image-picker-item')).toHaveLength(3),
      )
      expect(screen.getAllByTestId('image-name')[0]).toHaveTextContent(
        'new-image',
      )
    })

    it('does not upload when file input has no file', async () => {
      const postSpy = vi.spyOn(axios, 'post')

      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.queryByTestId('picker-loading')).not.toBeInTheDocument(),
      )

      const input = screen.getByTestId('upload-file-input') as HTMLInputElement
      Object.defineProperty(input, 'files', {
        value: null,
        configurable: true,
      })
      await changeUploadInput(input)

      expect(postSpy).not.toHaveBeenCalled()
    })

    it('file input has correct accept attribute', async () => {
      renderApp(
        <ImagePicker open={true} onClose={mockOnClose} onPick={mockOnPick} />,
      )
      await waitFor(() =>
        expect(screen.queryByTestId('picker-loading')).not.toBeInTheDocument(),
      )
      expect(screen.getByTestId('upload-file-input')).toHaveAttribute(
        'accept',
        'image/jpeg,image/png,image/webp,image/gif',
      )
    })
  })

  it('does not load more when already loading more', async () => {
    let resolveSecond: (value: unknown) => void = () => {
      throw new Error('Second page resolver was not initialized')
    }
    const secondCall = new Promise((resolve) => {
      resolveSecond = resolve
    })

    vi.spyOn(axios, 'get')
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
      resolveSecond({
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

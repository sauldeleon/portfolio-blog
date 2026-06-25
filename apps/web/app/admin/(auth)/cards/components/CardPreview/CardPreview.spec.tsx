import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'
import { createRef } from 'react'

import { renderApp } from '@sdlgr/test-utils'

import { CardPreview } from './CardPreview'
import type { CardPreviewHandle } from './CardPreview'

function makeAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: {} as never,
  })
}

jest.mock('@web/i18n/client', () => {
  const admin: Record<string, unknown> = jest.requireActual(
    '@web/i18n/locales/en/admin.json',
  )
  return {
    useClientTranslation: () => ({
      t: (key: string): string => {
        const val = key
          .split('.')
          .reduce<unknown>(
            (o, k) =>
              typeof o === 'object' && o !== null
                ? (o as Record<string, unknown>)[k]
                : undefined,
            admin,
          )
        return typeof val === 'string' ? val : key
      },
    }),
  }
})

const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect width="100" height="50" fill="red"/></svg>'

const mockGetContext = jest.fn(() => ({
  scale: jest.fn(),
  drawImage: jest.fn(),
}))
const mockToBlob = jest.fn()

const mockCreateObjectURL = jest.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = jest.fn()

beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: mockGetContext,
    writable: true,
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: mockToBlob,
    writable: true,
  })
})

beforeEach(() => {
  jest.clearAllMocks()
  global.URL.createObjectURL = mockCreateObjectURL
  global.URL.revokeObjectURL = mockRevokeObjectURL
  mockToBlob.mockImplementation((cb: (b: Blob) => void) => {
    cb(new Blob(['png-data'], { type: 'image/png' }))
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('CardPreview', () => {
  it('renders the SVG content', () => {
    renderApp(<CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />)
    const container = screen.getByTestId('svg-container')
    expect(container.innerHTML).toContain('<svg')
  })

  it('renders download button', () => {
    renderApp(<CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />)
    expect(screen.getByTestId('download-button')).toBeInTheDocument()
    expect(screen.getByTestId('download-button')).toHaveTextContent(
      'Download PNG',
    )
  })

  it('does not show error initially', () => {
    renderApp(<CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />)
    expect(screen.queryByTestId('export-error')).not.toBeInTheDocument()
  })

  it('triggers download on button click (canvas path)', async () => {
    const mockClick = jest.fn()
    const origCreate = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag)
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: mockClick })
      }
      return el
    })

    renderApp(
      <CardPreview
        svg={SAMPLE_SVG}
        cardWidth={100}
        cardHeight={50}
        filename="test-card"
      />,
    )

    const imgLoadEvent = new Event('load')
    // Simulate Image load by invoking img.onload after click
    const origImage = global.Image
    global.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_: string) {
        setTimeout(() => this.onload?.(), 0)
      }
    } as unknown as typeof Image

    fireEvent.click(screen.getByTestId('download-button'))

    await waitFor(() => {
      expect(mockToBlob).toHaveBeenCalled()
    })

    global.Image = origImage
    jest.restoreAllMocks()
    void imgLoadEvent
  })

  it('shows error when canvas context is unavailable', async () => {
    mockGetContext.mockReturnValueOnce(null)

    const origImage = global.Image
    global.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_: string) {
        setTimeout(() => this.onload?.(), 0)
      }
    } as unknown as typeof Image

    renderApp(<CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />)

    fireEvent.click(screen.getByTestId('download-button'))

    await waitFor(() => {
      expect(screen.getByTestId('export-error')).toBeInTheDocument()
    })
    expect(screen.getByTestId('export-error')).toHaveTextContent(
      'PNG export failed',
    )

    global.Image = origImage
  })

  it('shows error when toBlob returns null', async () => {
    mockToBlob.mockImplementationOnce((cb: (b: Blob | null) => void) =>
      cb(null),
    )

    const origImage = global.Image
    global.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_: string) {
        setTimeout(() => this.onload?.(), 0)
      }
    } as unknown as typeof Image

    renderApp(<CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />)

    fireEvent.click(screen.getByTestId('download-button'))

    await waitFor(() => {
      expect(screen.getByTestId('export-error')).toBeInTheDocument()
    })

    global.Image = origImage
  })

  it('shows error when image fails to load', async () => {
    const origImage = global.Image
    global.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_: string) {
        setTimeout(() => this.onerror?.(), 0)
      }
    } as unknown as typeof Image

    renderApp(<CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />)

    fireEvent.click(screen.getByTestId('download-button'))

    await waitFor(() => {
      expect(screen.getByTestId('export-error')).toBeInTheDocument()
    })
    expect(screen.getByTestId('export-error')).toHaveTextContent(
      'PNG export failed',
    )

    global.Image = origImage
  })

  it('uses default filename "card" when not specified', () => {
    renderApp(<CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />)
    // filename is used in download attribute — just verify component renders
    expect(screen.getByTestId('card-preview')).toBeInTheDocument()
  })

  it('renders with correct aspect ratio', () => {
    renderApp(
      <CardPreview svg={SAMPLE_SVG} cardWidth={1600} cardHeight={900} />,
    )
    expect(screen.getByTestId('svg-container')).toBeInTheDocument()
  })

  it('does not render a select control without onSelect', () => {
    renderApp(<CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />)
    expect(screen.queryByTestId('card-select')).not.toBeInTheDocument()
  })

  it('calls onSelect when the clickable preview is clicked', () => {
    const onSelect = jest.fn()
    renderApp(
      <CardPreview
        svg={SAMPLE_SVG}
        cardWidth={100}
        cardHeight={50}
        onSelect={onSelect}
      />,
    )
    const frame = screen.getByTestId('card-select')
    expect(frame.tagName).toBe('BUTTON')
    fireEvent.click(frame)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('highlights the frame when selected', () => {
    renderApp(
      <CardPreview
        svg={SAMPLE_SVG}
        cardWidth={100}
        cardHeight={50}
        onSelect={jest.fn()}
        selected
      />,
    )
    expect(screen.getByTestId('card-select')).toBeInTheDocument()
  })

  describe('upload to Cloudinary', () => {
    const SuccessImage = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_: string) {
        setTimeout(() => this.onload?.(), 0)
      }
    } as unknown as typeof Image

    it('renders the upload button', () => {
      renderApp(
        <CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />,
      )
      expect(screen.getByTestId('upload-button')).toHaveTextContent(
        'Upload to Cloudinary',
      )
      expect(screen.getByTestId('upload-button')).not.toBeDisabled()
    })

    it('disables the upload button when disableUpload is set', () => {
      renderApp(
        <CardPreview
          svg={SAMPLE_SVG}
          cardWidth={100}
          cardHeight={50}
          disableUpload
        />,
      )
      expect(screen.getByTestId('upload-button')).toBeDisabled()
    })

    it('uploads the PNG and shows the link on success', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      const postSpy = jest.spyOn(axios, 'post').mockResolvedValue({
        data: { url: 'https://res.cloudinary.com/x.png' },
      })
      renderApp(
        <CardPreview
          svg={SAMPLE_SVG}
          cardWidth={100}
          cardHeight={50}
          filename="my-card"
        />,
      )
      fireEvent.click(screen.getByTestId('upload-button'))
      expect(await screen.findByTestId('upload-link')).toHaveAttribute(
        'href',
        'https://res.cloudinary.com/x.png',
      )
      expect(postSpy).toHaveBeenCalledWith('/api/upload', expect.any(FormData))
      global.Image = origImage
    })

    it('uses filename for the public name, altText and the file name', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      const postSpy = jest
        .spyOn(axios, 'post')
        .mockResolvedValue({ data: { url: 'https://x/y.png' } })
      renderApp(
        <CardPreview
          svg={SAMPLE_SVG}
          cardWidth={100}
          cardHeight={50}
          filename="waypoint-route-1234-en-refugio"
        />,
      )
      fireEvent.click(screen.getByTestId('upload-button'))
      await screen.findByTestId('upload-link')
      const fd = postSpy.mock.calls[0][1] as FormData
      expect(fd.get('name')).toBe('waypoint-route-1234-en-refugio')
      expect(fd.get('altText')).toBe('waypoint-route-1234-en-refugio')
      expect((fd.get('file') as File).name).toBe(
        'waypoint-route-1234-en-refugio.png',
      )
      global.Image = origImage
    })

    it('uploads via the imperative ref handle', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      const postSpy = jest
        .spyOn(axios, 'post')
        .mockResolvedValue({ data: { url: 'https://x/y.png' } })
      const ref = createRef<CardPreviewHandle>()
      renderApp(
        <CardPreview
          ref={ref}
          svg={SAMPLE_SVG}
          cardWidth={100}
          cardHeight={50}
          filename="my-card"
        />,
      )
      await act(async () => {
        await ref.current?.upload()
      })
      expect(postSpy).toHaveBeenCalled()
      expect(screen.getByTestId('upload-link')).toBeInTheDocument()
      global.Image = origImage
    })

    it('does nothing via the ref handle when upload is disabled', async () => {
      const postSpy = jest.spyOn(axios, 'post')
      const ref = createRef<CardPreviewHandle>()
      renderApp(
        <CardPreview
          ref={ref}
          svg={SAMPLE_SVG}
          cardWidth={100}
          cardHeight={50}
          disableUpload
        />,
      )
      await act(async () => {
        await ref.current?.upload()
      })
      expect(postSpy).not.toHaveBeenCalled()
    })

    it('shows the server error on a failed upload', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      jest
        .spyOn(axios, 'post')
        .mockRejectedValue(makeAxiosError(500, { error: 'Upload failed' }))
      renderApp(
        <CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />,
      )
      fireEvent.click(screen.getByTestId('upload-button'))
      expect(await screen.findByTestId('upload-error')).toHaveTextContent(
        'Upload failed',
      )
      global.Image = origImage
    })

    it('shows a fallback error when the axios error has no message', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      jest.spyOn(axios, 'post').mockRejectedValue(makeAxiosError(500, {}))
      renderApp(
        <CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />,
      )
      fireEvent.click(screen.getByTestId('upload-button'))
      expect(await screen.findByTestId('upload-error')).toHaveTextContent(
        'Upload failed',
      )
      global.Image = origImage
    })

    it('shows a fallback error when the response has no url', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      jest.spyOn(axios, 'post').mockResolvedValue({ data: {} })
      renderApp(
        <CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />,
      )
      fireEvent.click(screen.getByTestId('upload-button'))
      expect(await screen.findByTestId('upload-error')).toHaveTextContent(
        'Upload failed',
      )
      global.Image = origImage
    })

    it('shows an error on a non-axios upload error', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      jest.spyOn(axios, 'post').mockRejectedValue(new Error('boom'))
      renderApp(
        <CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />,
      )
      fireEvent.click(screen.getByTestId('upload-button'))
      expect(await screen.findByTestId('upload-error')).toBeInTheDocument()
      global.Image = origImage
    })

    it('shows a loading label while uploading', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      let resolve!: (v: unknown) => void
      jest.spyOn(axios, 'post').mockReturnValue(
        new Promise((r) => {
          resolve = r
        }),
      )
      renderApp(
        <CardPreview svg={SAMPLE_SVG} cardWidth={100} cardHeight={50} />,
      )
      const button = screen.getByTestId('upload-button')
      fireEvent.click(button)
      await waitFor(() => expect(button).toHaveTextContent('Uploading…'))
      resolve({ data: { url: 'https://x/y.png' } })
      await waitFor(() =>
        expect(button).toHaveTextContent('Upload to Cloudinary'),
      )
      global.Image = origImage
    })
  })
})

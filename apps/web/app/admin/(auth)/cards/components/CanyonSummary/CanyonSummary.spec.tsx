import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import type { CanyoningCardData } from '@web/lib/cards'

import { CanyonSummary } from './CanyonSummary'

function makeAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: {} as never,
  })
}

vi.mock('@web/i18n/client', async () => {
  const admin: Record<string, unknown> = await vi.importActual<
    typeof import('@web/i18n/locales/en/admin.json')
  >('@web/i18n/locales/en/admin.json')
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

vi.mock('@web/components/CanyonSummary', async () => ({
  ...(await vi.importActual<typeof import('@web/components/CanyonSummary')>(
    '@web/components/CanyonSummary',
  )),
  CanyonSummaryMap: () => <div data-testid="canyon-summary-map-mock" />,
}))

const DATA: CanyoningCardData = {
  kind: 'canyoning-data',
  lang: 'en',
  grade: 'v4 a3 III',
}

const SuccessImage = class {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  set src(_: string) {
    setTimeout(() => this.onload?.(), 0)
  }
} as unknown as typeof Image

type MockContext = {
  scale: ReturnType<typeof vi.fn>
  drawImage: ReturnType<typeof vi.fn>
}
const mockGetContext = vi.fn((): MockContext | null => ({
  scale: vi.fn(),
  drawImage: vi.fn(),
}))
const mockToBlob = vi.fn()
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

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
  vi.clearAllMocks()
  global.URL.createObjectURL = mockCreateObjectURL
  global.URL.revokeObjectURL = mockRevokeObjectURL
  mockToBlob.mockImplementation((cb: (b: Blob) => void) =>
    cb(new Blob(['png'], { type: 'image/png' })),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('CanyonSummary (admin preview)', () => {
  it('renders the interactive card and the export bar', () => {
    renderApp(<CanyonSummary data={DATA} />)
    expect(screen.getByTestId('canyon-summary-map-mock')).toBeInTheDocument()
    expect(screen.getByTestId('canyon-summary-download')).toBeInTheDocument()
    expect(screen.getByTestId('canyon-summary-upload')).toBeInTheDocument()
  })

  describe('PNG export', () => {
    it('downloads on click', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      renderApp(<CanyonSummary data={DATA} filename="my-canyon" />)
      fireEvent.click(screen.getByTestId('canyon-summary-download'))
      await waitFor(() => expect(mockToBlob).toHaveBeenCalled())
      global.Image = origImage
    })

    it('shows an error when the canvas is unavailable', async () => {
      mockGetContext.mockReturnValueOnce(null)
      const origImage = global.Image
      global.Image = SuccessImage
      renderApp(<CanyonSummary data={DATA} />)
      fireEvent.click(screen.getByTestId('canyon-summary-download'))
      expect(
        await screen.findByTestId('canyon-summary-export-error'),
      ).toBeInTheDocument()
      global.Image = origImage
    })
  })

  describe('upload', () => {
    it('uploads and shows the link', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      const postSpy = vi
        .spyOn(axios, 'post')
        .mockResolvedValue({ data: { url: 'https://x/y.png' } })
      renderApp(<CanyonSummary data={DATA} filename="c" />)
      fireEvent.click(screen.getByTestId('canyon-summary-upload'))
      expect(
        await screen.findByTestId('canyon-summary-upload-link'),
      ).toHaveAttribute('href', 'https://x/y.png')
      expect(postSpy).toHaveBeenCalledWith('/api/upload', expect.any(FormData))
      global.Image = origImage
    })

    it('shows the server error on failure', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      vi.spyOn(axios, 'post').mockRejectedValue(
        makeAxiosError(500, { error: 'Upload failed' }),
      )
      renderApp(<CanyonSummary data={DATA} />)
      fireEvent.click(screen.getByTestId('canyon-summary-upload'))
      expect(
        await screen.findByTestId('canyon-summary-upload-error'),
      ).toHaveTextContent('Upload failed')
      global.Image = origImage
    })

    it('shows a fallback error when the response has no url', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      vi.spyOn(axios, 'post').mockResolvedValue({ data: {} })
      renderApp(<CanyonSummary data={DATA} />)
      fireEvent.click(screen.getByTestId('canyon-summary-upload'))
      expect(
        await screen.findByTestId('canyon-summary-upload-error'),
      ).toBeInTheDocument()
      global.Image = origImage
    })

    it('shows a loading label while uploading', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      let resolve!: (v: unknown) => void
      vi.spyOn(axios, 'post').mockReturnValue(
        new Promise((r) => {
          resolve = r
        }),
      )
      renderApp(<CanyonSummary data={DATA} />)
      const button = screen.getByTestId('canyon-summary-upload')
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

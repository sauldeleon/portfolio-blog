import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import type { SummaryFerrataData } from '@web/lib/cards'

import { FerrataSummary } from './FerrataSummary'

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

vi.mock('@web/components/FerrataSummary', async () => ({
  ...(await vi.importActual<typeof import('@web/components/FerrataSummary')>(
    '@web/components/FerrataSummary',
  )),
  FerrataSummaryMap: () => <div data-testid="ferrata-summary-map-mock" />,
}))

const DATA: SummaryFerrataData = {
  kind: 'summary-ferrata',
  lang: 'en',
  grade: 'K3',
}

const SuccessImage = class {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  set src(_: string) {
    setTimeout(() => this.onload?.(), 0)
  }
} as unknown as typeof Image

const mockGetContext = vi.fn(() => ({
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

describe('FerrataSummary (admin preview)', () => {
  it('renders the interactive card and the export bar', () => {
    renderApp(<FerrataSummary data={DATA} />)
    expect(screen.getByTestId('ferrata-summary-map-mock')).toBeInTheDocument()
    expect(screen.getByTestId('ferrata-summary-download')).toBeInTheDocument()
    expect(screen.getByTestId('ferrata-summary-upload')).toBeInTheDocument()
  })

  describe('PNG export', () => {
    it('downloads on click', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      renderApp(<FerrataSummary data={DATA} filename="my-ferrata" />)
      fireEvent.click(screen.getByTestId('ferrata-summary-download'))
      await waitFor(() => expect(mockToBlob).toHaveBeenCalled())
      global.Image = origImage
    })

    it('shows an error when the canvas is unavailable', async () => {
      mockGetContext.mockReturnValueOnce(null)
      const origImage = global.Image
      global.Image = SuccessImage
      renderApp(<FerrataSummary data={DATA} />)
      fireEvent.click(screen.getByTestId('ferrata-summary-download'))
      expect(
        await screen.findByTestId('ferrata-summary-export-error'),
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
      renderApp(<FerrataSummary data={DATA} filename="c" />)
      fireEvent.click(screen.getByTestId('ferrata-summary-upload'))
      expect(
        await screen.findByTestId('ferrata-summary-upload-link'),
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
      renderApp(<FerrataSummary data={DATA} />)
      fireEvent.click(screen.getByTestId('ferrata-summary-upload'))
      expect(
        await screen.findByTestId('ferrata-summary-upload-error'),
      ).toHaveTextContent('Upload failed')
      global.Image = origImage
    })

    it('shows a fallback error when the response has no url', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      vi.spyOn(axios, 'post').mockResolvedValue({ data: {} })
      renderApp(<FerrataSummary data={DATA} />)
      fireEvent.click(screen.getByTestId('ferrata-summary-upload'))
      expect(
        await screen.findByTestId('ferrata-summary-upload-error'),
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
      renderApp(<FerrataSummary data={DATA} />)
      const button = screen.getByTestId('ferrata-summary-upload')
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

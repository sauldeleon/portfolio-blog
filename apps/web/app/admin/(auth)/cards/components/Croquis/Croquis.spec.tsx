import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import type { CroquisObstacle } from '@web/lib/cards'

import { Croquis } from './Croquis'

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

jest.mock('@web/components/Croquis', () => ({
  CroquisMap: () => <div data-testid="croquis-map-mock" />,
}))

function ob(overrides: Partial<CroquisObstacle> = {}): CroquisObstacle {
  return {
    type: 'salto',
    title: 'Jump one',
    meters: 5,
    side: null,
    severity: 'easy',
    notes: [],
    ...overrides,
  }
}

const SuccessImage = class {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  set src(_: string) {
    setTimeout(() => this.onload?.(), 0)
  }
} as unknown as typeof Image

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
  mockToBlob.mockImplementation((cb: (b: Blob) => void) =>
    cb(new Blob(['png'], { type: 'image/png' })),
  )
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('Croquis (admin preview)', () => {
  it('renders the interactive map and the export bar', () => {
    renderApp(<Croquis obstacles={[ob()]} lang="en" />)
    expect(screen.getByTestId('croquis-map-mock')).toBeInTheDocument()
    expect(screen.getByTestId('croquis-download')).toBeInTheDocument()
    expect(screen.getByTestId('croquis-upload')).toBeInTheDocument()
  })

  describe('PNG export', () => {
    it('downloads on click', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      renderApp(<Croquis obstacles={[ob()]} lang="en" filename="my-croquis" />)
      fireEvent.click(screen.getByTestId('croquis-download'))
      await waitFor(() => expect(mockToBlob).toHaveBeenCalled())
      global.Image = origImage
    })

    it('shows an error when the canvas is unavailable', async () => {
      mockGetContext.mockReturnValueOnce(null)
      const origImage = global.Image
      global.Image = SuccessImage
      renderApp(<Croquis obstacles={[ob()]} lang="en" />)
      fireEvent.click(screen.getByTestId('croquis-download'))
      expect(
        await screen.findByTestId('croquis-export-error'),
      ).toBeInTheDocument()
      global.Image = origImage
    })
  })

  describe('upload', () => {
    it('uploads and shows the link', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      const postSpy = jest
        .spyOn(axios, 'post')
        .mockResolvedValue({ data: { url: 'https://x/y.png' } })
      renderApp(<Croquis obstacles={[ob()]} lang="en" filename="c" />)
      fireEvent.click(screen.getByTestId('croquis-upload'))
      expect(await screen.findByTestId('croquis-upload-link')).toHaveAttribute(
        'href',
        'https://x/y.png',
      )
      expect(postSpy).toHaveBeenCalledWith('/api/upload', expect.any(FormData))
      global.Image = origImage
    })

    it('shows the server error on failure', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      jest
        .spyOn(axios, 'post')
        .mockRejectedValue(makeAxiosError(500, { error: 'Upload failed' }))
      renderApp(<Croquis obstacles={[ob()]} lang="en" />)
      fireEvent.click(screen.getByTestId('croquis-upload'))
      expect(
        await screen.findByTestId('croquis-upload-error'),
      ).toHaveTextContent('Upload failed')
      global.Image = origImage
    })

    it('falls back to a generic error when the axios error has no message', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      jest.spyOn(axios, 'post').mockRejectedValue(makeAxiosError(500, {}))
      renderApp(<Croquis obstacles={[ob()]} lang="en" />)
      fireEvent.click(screen.getByTestId('croquis-upload'))
      expect(
        await screen.findByTestId('croquis-upload-error'),
      ).toHaveTextContent('Upload failed')
      global.Image = origImage
    })

    it('shows a fallback error when the response has no url', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      jest.spyOn(axios, 'post').mockResolvedValue({ data: {} })
      renderApp(<Croquis obstacles={[ob()]} lang="en" />)
      fireEvent.click(screen.getByTestId('croquis-upload'))
      expect(
        await screen.findByTestId('croquis-upload-error'),
      ).toBeInTheDocument()
      global.Image = origImage
    })

    it('shows an error on a non-axios failure', async () => {
      const origImage = global.Image
      global.Image = SuccessImage
      jest.spyOn(axios, 'post').mockRejectedValue(new Error('boom'))
      renderApp(<Croquis obstacles={[ob()]} lang="en" />)
      fireEvent.click(screen.getByTestId('croquis-upload'))
      expect(
        await screen.findByTestId('croquis-upload-error'),
      ).toBeInTheDocument()
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
      renderApp(<Croquis obstacles={[ob()]} lang="en" />)
      const button = screen.getByTestId('croquis-upload')
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

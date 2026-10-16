import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { AxiosError, AxiosHeaders } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import {
  TrackUploadModal,
  type TrackUploadModalProps,
} from './TrackUploadModal'

const mockUploadTrackFile = vi.fn()
const mockSerializeGpxFile = vi.fn()
let mockOnDrop: ((files: File[]) => void) | null = null
let mockIsDragActive = false

vi.mock('react-dropzone', () => ({
  useDropzone: ({ onDrop }: { onDrop: (files: File[]) => void }) => {
    mockOnDrop = onDrop
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: mockIsDragActive,
    }
  },
}))

vi.mock('react-overlays', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-overlays')>()),
  Modal: ({
    show,
    children,
    renderBackdrop,
    onHide,
  }: {
    show: boolean
    children: React.ReactNode
    renderBackdrop: (props: unknown) => React.ReactNode
    onHide: () => void
  }) =>
    show ? (
      <div>
        {renderBackdrop({})}
        <button data-testid="modal-hide" onClick={onHide} />
        {children}
      </div>
    ) : null,
}))

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}))

vi.mock('@sdlgr/gpx-tools', async () => ({
  ...(await vi.importActual<typeof import('@sdlgr/gpx-tools')>(
    '@sdlgr/gpx-tools',
  )),
  serializeGpxFile: (...args: unknown[]) => mockSerializeGpxFile(...args),
}))

const { serializeGpxFile: actualSerializeGpxFile } =
  await vi.importActual<typeof import('@sdlgr/gpx-tools')>('@sdlgr/gpx-tools')

vi.mock('../../utils/trackApi', async () => ({
  ...(await vi.importActual<typeof import('../../utils/trackApi')>(
    '../../utils/trackApi',
  )),
  uploadTrackFile: (...args: unknown[]) => mockUploadTrackFile(...args),
}))

const GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1">
  <metadata><name>Old</name></metadata>
  <wpt lat="42" lon="0"><name>W</name></wpt>
  <trk><name>Old track</name><trkseg>
    <trkpt lat="42" lon="0"/><trkpt lat="42.01" lon="0"/>
  </trkseg></trk>
</gpx>`

function gpxFile(name: string, content = GPX): File {
  const file = new File([content], name, { type: 'application/gpx+xml' })
  return Object.assign(file, { text: () => Promise.resolve(content) })
}

function renderModal(props: Partial<TrackUploadModalProps> = {}) {
  const callbacks = { onClose: vi.fn(), onUploaded: vi.fn() }
  renderApp(
    <TrackUploadModal isOpen existingPaths={[]} {...callbacks} {...props} />,
  )
  return callbacks
}

async function drop(file: File) {
  await act(async () => {
    mockOnDrop?.([file])
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSerializeGpxFile.mockImplementation(actualSerializeGpxFile)
  mockIsDragActive = false
  mockOnDrop = null
})

describe('TrackUploadModal', () => {
  it('renders nothing when closed', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByTestId('track-upload-modal')).not.toBeInTheDocument()
  })

  it('shows the dropzone', () => {
    renderModal()
    expect(screen.getByTestId('upload-dropzone')).toHaveTextContent(
      'tracks.upload.dropzone',
    )
    expect(screen.queryByTestId('upload-submit')).not.toBeInTheDocument()
  })

  it('shows the drag-active text', () => {
    mockIsDragActive = true
    renderModal()
    expect(screen.getByTestId('upload-dropzone')).toHaveTextContent(
      'tracks.upload.dropzoneActive',
    )
  })

  it('ignores an empty drop', async () => {
    renderModal()
    await act(async () => mockOnDrop?.([]))
    expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
  })

  it('rejects files that are not GPX', async () => {
    renderModal()
    await drop(gpxFile('bad.gpx', '<kml/>'))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'tracks.upload.invalidFile',
    )
    expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
  })

  it('pre-fills the name from the file and summarises it', async () => {
    renderModal()
    await drop(gpxFile('Día 1.gpx'))
    expect(screen.getByTestId('upload-name')).toHaveValue('Día 1')
    expect(screen.getByTestId('upload-file-summary')).toHaveTextContent(
      '"file":"Día 1.gpx","tracks":1,"points":2',
    )
    expect(screen.getByTestId('upload-file-summary')).toHaveTextContent(
      '"waypoints":1',
    )
  })

  it('validates the name', async () => {
    renderModal({ existingPaths: ['Taken.gpx'] })
    await drop(gpxFile('a.gpx'))
    const input = screen.getByTestId('upload-name')
    fireEvent.change(input, { target: { value: 'route-clean' } })
    expect(screen.getByTestId('upload-name-error')).toHaveTextContent(
      'tracks.upload.invalidName',
    )
    expect(screen.getByTestId('upload-submit')).toBeDisabled()
    fireEvent.change(input, { target: { value: ' Taken ' } })
    expect(screen.getByTestId('upload-name-error')).toHaveTextContent(
      'tracks.upload.exists {"path":"Taken.gpx"}',
    )
    fireEvent.change(input, { target: { value: 'Fine' } })
    expect(screen.queryByTestId('upload-name-error')).not.toBeInTheDocument()
    expect(screen.getByTestId('upload-submit')).toBeEnabled()
  })

  it('uploads the renamed GPX and reports back', async () => {
    let resolveUpload: (value: unknown) => void = () => undefined
    mockUploadTrackFile.mockReturnValue(
      new Promise((resolve) => {
        resolveUpload = resolve
      }),
    )
    const { onUploaded } = renderModal()
    await drop(gpxFile('a.gpx'))
    fireEvent.change(screen.getByTestId('upload-name'), {
      target: { value: '  Ordesa  ' },
    })
    fireEvent.click(screen.getByTestId('upload-submit'))
    await waitFor(() =>
      expect(screen.getByTestId('upload-submit')).toHaveTextContent(
        'tracks.upload.uploading',
      ),
    )
    const [name, content] = mockUploadTrackFile.mock.calls[0]
    expect(name).toBe('Ordesa')
    expect(content).toMatch(/<metadata>\s*<name>Ordesa<\/name>/)
    expect(content).toMatch(/<trk>\s*<name>Ordesa<\/name>/)
    await act(async () => resolveUpload({ path: 'Ordesa.gpx' }))
    expect(onUploaded).toHaveBeenCalledWith({ path: 'Ordesa.gpx' })
    // Reset for the next upload.
    expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
  })

  it('refuses files too large to upload', async () => {
    renderModal()
    mockSerializeGpxFile.mockImplementation(function () {
      return 'x'.repeat(4_000_001)
    })
    await drop(gpxFile('big.gpx'))
    fireEvent.click(screen.getByTestId('upload-submit'))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'tracks.upload.tooLarge',
    )
    expect(mockUploadTrackFile).not.toHaveBeenCalled()
  })

  it('shows the server error message', async () => {
    mockUploadTrackFile.mockRejectedValue(
      new AxiosError('fail', '409', undefined, undefined, {
        status: 409,
        statusText: 'Conflict',
        data: { error: 'a.gpx already exists' },
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
    )
    renderModal()
    await drop(gpxFile('a.gpx'))
    fireEvent.click(screen.getByTestId('upload-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'a.gpx already exists',
    )
  })

  it('falls back to a generic error', async () => {
    mockUploadTrackFile.mockRejectedValue(new Error('network'))
    renderModal()
    await drop(gpxFile('a.gpx'))
    fireEvent.click(screen.getByTestId('upload-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'tracks.upload.error',
    )
  })

  it('lets you pick another file', async () => {
    renderModal()
    await drop(gpxFile('a.gpx'))
    fireEvent.click(screen.getByTestId('upload-change-file'))
    expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
  })

  it('resets and closes on cancel and on hide', async () => {
    const { onClose } = renderModal()
    await drop(gpxFile('a.gpx'))
    fireEvent.click(screen.getByText('tracks.upload.cancel'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('modal-hide'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})

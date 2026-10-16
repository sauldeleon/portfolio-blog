import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { TrackEditor } from './TrackEditor'

const mockFetchTrackFile = vi.fn()
const mockFetchTrackFiles = vi.fn()

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../../utils/trackApi', async () => ({
  ...(await vi.importActual<typeof import('../../utils/trackApi')>(
    '../../utils/trackApi',
  )),
  fetchTrackFile: (path: string) => mockFetchTrackFile(path),
  fetchTrackFiles: () => mockFetchTrackFiles(),
}))

vi.mock('../TrackWorkspace', () => ({
  TrackWorkspace: ({
    path,
    file,
    existingPaths,
  }: {
    path: string
    file: { tracks: unknown[] }
    existingPaths: string[]
  }) => (
    <div data-testid="workspace">
      {path}|{file.tracks.length}|{existingPaths.join(',')}
    </div>
  ),
}))

const GPX =
  '<gpx xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg><trkpt lat="1" lon="1"/></trkseg></trk></gpx>'

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchTrackFiles.mockResolvedValue({
    files: [{ path: 'a-clean.gpx' }],
    truncated: false,
  })
})

describe('TrackEditor', () => {
  it('shows a loading state', () => {
    mockFetchTrackFile.mockReturnValue(new Promise(() => undefined))
    renderApp(<TrackEditor path="a.gpx" />)
    expect(screen.getByText('tracks.editor.loading')).toBeInTheDocument()
  })

  it('shows a load error with a way back', async () => {
    mockFetchTrackFile.mockRejectedValue(new Error('boom'))
    renderApp(<TrackEditor path="a.gpx" />)
    expect(
      await screen.findByText(/tracks.editor.loadError/),
    ).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/admin/tracks')
  })

  it('shows a parse error', async () => {
    mockFetchTrackFile.mockResolvedValue({ path: 'a.gpx', content: 'nope<' })
    renderApp(<TrackEditor path="a.gpx" />)
    expect(
      await screen.findByText(/tracks.editor.parseError/),
    ).toBeInTheDocument()
  })

  it('renders the workspace with the parsed file', async () => {
    mockFetchTrackFile.mockResolvedValue({ path: 'a.gpx', content: GPX })
    renderApp(<TrackEditor path="a.gpx" />)
    expect(await screen.findByTestId('workspace')).toHaveTextContent('a.gpx|1|')
    expect(await screen.findByText('a.gpx|1|a-clean.gpx')).toBeInTheDocument()
  })
})

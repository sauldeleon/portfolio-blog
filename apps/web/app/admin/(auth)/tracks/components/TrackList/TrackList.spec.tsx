import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { TRACKS_PER_PAGE, TrackList } from './TrackList'

const mockFetchTrackFiles = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

jest.mock('../../utils/trackApi', () => ({
  ...jest.requireActual('../../utils/trackApi'),
  fetchTrackFiles: () => mockFetchTrackFiles(),
}))

const listing = (files: unknown[], truncated = false) => ({ files, truncated })

const file = (path: string) => ({
  path,
  size: 2048,
  rawUrl: `https://raw/${path}`,
})

const mockReplace = jest.fn()
let mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/admin/tracks',
  useSearchParams: () => mockSearchParams,
}))

jest.mock('@sdlgr/pagination', () => ({
  Pagination: ({
    total,
    page,
    limit,
  }: {
    total: number
    page: number
    limit: number
  }) => (
    <div
      data-testid="pagination"
      data-total={total}
      data-page={page}
      data-limit={limit}
    />
  ),
}))

jest.mock('../TrackUploadModal', () => ({
  TrackUploadModal: ({
    isOpen,
    onClose,
    onUploaded,
    existingPaths,
  }: {
    isOpen: boolean
    onClose: () => void
    onUploaded: (saved: { path: string }) => void
    existingPaths: string[]
  }) =>
    isOpen ? (
      <div data-testid="upload-modal" data-existing={existingPaths.join(',')}>
        <button data-testid="upload-close" onClick={onClose} />
        <button
          data-testid="upload-done"
          onClick={() => onUploaded({ path: 'New track.gpx' })}
        />
      </div>
    ) : null,
}))

const mockWriteText = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  mockSearchParams = new URLSearchParams()
  mockWriteText.mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText: mockWriteText } })
})

describe('TrackList', () => {
  it('shows a loading state', () => {
    mockFetchTrackFiles.mockReturnValue(new Promise(() => undefined))
    renderApp(<TrackList />)
    expect(screen.getByText('tracks.list.loading')).toBeInTheDocument()
  })

  it('shows an error state', async () => {
    mockFetchTrackFiles.mockRejectedValue(new Error('boom'))
    renderApp(<TrackList />)
    expect(await screen.findByText('tracks.list.error')).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    mockFetchTrackFiles.mockResolvedValue(listing([]))
    renderApp(<TrackList />)
    expect(await screen.findByText('tracks.list.empty')).toBeInTheDocument()
  })

  it('lists grouped tracks with edit links', async () => {
    mockFetchTrackFiles.mockResolvedValue(
      listing([file('a.gpx'), file('a-clean.gpx'), file('b.gpx')]),
    )
    renderApp(<TrackList />)
    const row = await screen.findByTestId('track-row-a')
    const links = within(row).getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/admin/tracks/edit?path=a.gpx')
    expect(links[0]).toHaveTextContent('tracks.list.editOriginal')
    expect(links[1]).toHaveAttribute(
      'href',
      '/admin/tracks/edit?path=a-clean.gpx',
    )
    expect(links[1]).toHaveTextContent('tracks.list.editClean')
    expect(
      within(screen.getByTestId('track-row-b')).getAllByRole('link'),
    ).toHaveLength(1)
  })

  it('filters by search', async () => {
    mockFetchTrackFiles.mockResolvedValue(
      listing([file('Ordesa.gpx'), file('b.gpx')]),
    )
    renderApp(<TrackList />)
    await screen.findByTestId('track-row-b')
    fireEvent.change(screen.getByLabelText('tracks.list.searchPlaceholder'), {
      target: { value: 'ord' },
    })
    expect(screen.queryByTestId('track-row-b')).not.toBeInTheDocument()
    expect(screen.getByTestId('track-row-Ordesa')).toBeInTheDocument()
  })

  it('copies the raw URL', async () => {
    mockFetchTrackFiles.mockResolvedValue(
      listing([file('a.gpx'), file('a-clean.gpx')]),
    )
    renderApp(<TrackList />)
    fireEvent.click(await screen.findByTestId('copy-url-a-clean.gpx'))
    expect(mockWriteText).toHaveBeenCalledWith('https://raw/a-clean.gpx')
    await waitFor(() =>
      expect(screen.getByTestId('copy-url-a-clean.gpx')).toHaveTextContent(
        'tracks.list.copied',
      ),
    )
    expect(screen.getByTestId('copy-url-a.gpx')).toHaveTextContent(
      'tracks.list.copyUrl',
    )
  })

  it('refetches on refresh', async () => {
    mockFetchTrackFiles.mockResolvedValue(listing([]))
    renderApp(<TrackList />)
    await screen.findByText('tracks.list.empty')
    fireEvent.click(screen.getByTestId('tracks-refresh'))
    await waitFor(() => expect(mockFetchTrackFiles).toHaveBeenCalledTimes(2))
  })

  it('uploads a new track and links to the editor', async () => {
    mockFetchTrackFiles.mockResolvedValue(listing([file('a.gpx')]))
    renderApp(<TrackList />)
    await screen.findByTestId('track-row-a')
    fireEvent.click(screen.getByTestId('tracks-upload'))
    expect(screen.getByTestId('upload-modal')).toHaveAttribute(
      'data-existing',
      'a.gpx',
    )
    fireEvent.click(screen.getByTestId('upload-close'))
    expect(screen.queryByTestId('upload-modal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('tracks-upload'))
    fireEvent.click(screen.getByTestId('upload-done'))
    expect(screen.queryByTestId('upload-modal')).not.toBeInTheDocument()
    const notice = screen.getByTestId('upload-notice')
    expect(notice).toHaveTextContent('tracks.upload.done')
    expect(within(notice).getByRole('link')).toHaveAttribute(
      'href',
      '/admin/tracks/edit?path=New%20track.gpx',
    )
  })

  it('lists newest first and paginates', async () => {
    const files = Array.from({ length: TRACKS_PER_PAGE + 5 }, (_, i) =>
      file(`2026-01-${String(i + 1).padStart(2, '0')} route.gpx`),
    )
    mockFetchTrackFiles.mockResolvedValue(listing(files))
    renderApp(<TrackList />)
    const rows = await screen.findAllByTestId(/^track-row-/)
    expect(rows).toHaveLength(TRACKS_PER_PAGE)
    expect(rows[0]).toHaveTextContent('2026-01-30 route')
    expect(screen.getByTestId('tracks-count')).toHaveTextContent(
      'tracks.list.count',
    )
    expect(screen.getByTestId('pagination')).toHaveAttribute(
      'data-total',
      String(TRACKS_PER_PAGE + 5),
    )
    expect(screen.getByTestId('pagination')).toHaveAttribute('data-page', '1')
  })

  it('shows the page from the URL, clamped to the last one', async () => {
    const files = Array.from({ length: TRACKS_PER_PAGE + 5 }, (_, i) =>
      file(`2026-01-${String(i + 1).padStart(2, '0')} route.gpx`),
    )
    mockFetchTrackFiles.mockResolvedValue(listing(files))
    mockSearchParams = new URLSearchParams('page=9')
    renderApp(<TrackList />)
    const rows = await screen.findAllByTestId(/^track-row-/)
    expect(rows).toHaveLength(5)
    expect(screen.getByTestId('pagination')).toHaveAttribute('data-page', '2')
  })

  it('falls back to the first page for a bad page parameter', async () => {
    mockFetchTrackFiles.mockResolvedValue(listing([file('a.gpx')]))
    mockSearchParams = new URLSearchParams('page=nope')
    renderApp(<TrackList />)
    await screen.findByTestId('track-row-a')
    expect(screen.getByTestId('pagination')).toHaveAttribute('data-page', '1')
  })

  it('goes back to the first page when searching', async () => {
    mockFetchTrackFiles.mockResolvedValue(listing([file('a.gpx')]))
    renderApp(<TrackList />)
    await screen.findByTestId('track-row-a')
    fireEvent.change(screen.getByLabelText('tracks.list.searchPlaceholder'), {
      target: { value: 'a' },
    })
    expect(mockReplace).not.toHaveBeenCalled()
    mockSearchParams.set('page', '2')
    fireEvent.change(screen.getByLabelText('tracks.list.searchPlaceholder'), {
      target: { value: 'ab' },
    })
    expect(mockReplace).toHaveBeenCalledWith('/admin/tracks')
  })

  it('warns when GitHub truncated the list', async () => {
    mockFetchTrackFiles.mockResolvedValue(listing([file('a.gpx')], true))
    renderApp(<TrackList />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'tracks.list.truncated',
    )
  })
})

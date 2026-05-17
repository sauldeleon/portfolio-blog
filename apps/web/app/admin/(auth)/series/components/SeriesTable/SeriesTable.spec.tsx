import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import type { SeriesForAdmin } from '@web/lib/db/queries/series'

import { SeriesTable } from './SeriesTable'

const mockPush = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string, opts?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'series.searchPlaceholder': 'Search series…',
        'series.newSeries': 'New series',
        refresh: 'Refresh',
        'series.table.id': 'ID',
        'series.table.title': 'Title',
        'series.table.posts': 'Posts',
        'series.table.order': 'Order',
        'series.table.published': 'Published',
        'series.table.actions': 'Actions',
        'series.edit': 'Edit',
        'series.save': 'Save',
        'series.cancel': 'Cancel',
        'series.delete': 'Delete',
        'series.deleteConfirm': 'Delete this series?',
        'confirmDelete.confirm': 'Confirm delete',
        'confirmDelete.cancel': 'Cancel delete',
        'series.deleteTooltip': `Cannot delete — ${opts?.['count']} post(s) use this series`,
        'series.empty': 'No series found',
        'series.postsLoading': 'Loading posts…',
        'series.viewPost': 'View',
        'series.removeFromSeries': 'Remove from series',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

function makeSeries(overrides: Partial<SeriesForAdmin> = {}): SeriesForAdmin {
  return {
    id: 'my-series',
    postCount: 0,
    translations: [{ locale: 'en', title: 'My Series EN' }],
    ...overrides,
  }
}

describe('SeriesTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: [] } })
    jest.spyOn(axios, 'put').mockResolvedValue({ data: {} })
    jest.spyOn(axios, 'delete').mockResolvedValue({ data: {} })
  })

  it('renders all series rows', () => {
    renderApp(
      <SeriesTable
        series={[makeSeries({ id: 'a' }), makeSeries({ id: 'b' })]}
      />,
    )
    expect(screen.getAllByTestId('series-row')).toHaveLength(2)
  })

  it('shows series id in each row', () => {
    renderApp(<SeriesTable series={[makeSeries({ id: 'react-series' })]} />)
    expect(screen.getByText('react-series')).toBeInTheDocument()
  })

  it('shows EN title as display title', () => {
    renderApp(<SeriesTable series={[makeSeries()]} />)
    expect(screen.getByText('My Series EN')).toBeInTheDocument()
  })

  it('falls back to ES title when no EN translation', () => {
    renderApp(
      <SeriesTable
        series={[
          makeSeries({ translations: [{ locale: 'es', title: 'Mi Serie' }] }),
        ]}
      />,
    )
    expect(screen.getByText('Mi Serie')).toBeInTheDocument()
  })

  it('falls back to id when no translations exist', () => {
    renderApp(
      <SeriesTable
        series={[makeSeries({ id: 'my-series', translations: [] })]}
      />,
    )
    expect(screen.getAllByText('my-series')).toHaveLength(2)
  })

  it('shows 0 in post count cell when postCount is 0', () => {
    renderApp(<SeriesTable series={[makeSeries({ postCount: 0 })]} />)
    expect(screen.getByTestId('post-count')).toHaveTextContent('0')
  })

  it('shows empty state when no series match search', () => {
    renderApp(<SeriesTable series={[makeSeries()]} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'zzznomatch' },
    })
    expect(screen.queryByTestId('series-row')).not.toBeInTheDocument()
    expect(screen.getByText('No series found')).toBeInTheDocument()
  })

  it('filters by series id', () => {
    renderApp(
      <SeriesTable
        series={[makeSeries({ id: 'react' }), makeSeries({ id: 'vue' })]}
      />,
    )
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'react' },
    })
    expect(screen.getAllByTestId('series-row')).toHaveLength(1)
  })

  it('new series button navigates to /admin/series/new', () => {
    renderApp(<SeriesTable series={[]} />)
    fireEvent.click(screen.getByTestId('new-series-button'))
    expect(mockPush).toHaveBeenCalledWith('/admin/series/new')
  })

  it('refresh button fetches series from API', async () => {
    const freshSeries = makeSeries({ id: 'fresh' })
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      data: { data: [freshSeries] },
    })
    renderApp(<SeriesTable series={[]} />)
    fireEvent.click(screen.getByTestId('refresh-button'))
    expect(await screen.findByTestId('series-row')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalledWith('/api/series')
  })

  it('entering edit mode shows locale tabs, title input, Save and Cancel', () => {
    renderApp(<SeriesTable series={[makeSeries()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    expect(screen.getByTestId('locale-tab-en')).toBeInTheDocument()
    expect(screen.getByTestId('locale-tab-es')).toBeInTheDocument()
    expect(screen.getByTestId('edit-title-input')).toBeInTheDocument()
    expect(screen.getByTestId('save-button')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument()
  })

  it('edit pre-fills EN title', () => {
    renderApp(<SeriesTable series={[makeSeries()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    expect(screen.getByTestId('edit-title-input')).toHaveValue('My Series EN')
  })

  it('switching to ES tab pre-fills ES title', () => {
    renderApp(
      <SeriesTable
        series={[
          makeSeries({
            translations: [
              { locale: 'en', title: 'My Series EN' },
              { locale: 'es', title: 'Mi Serie ES' },
            ],
          }),
        ]}
      />,
    )
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('locale-tab-es'))
    expect(screen.getByTestId('edit-title-input')).toHaveValue('Mi Serie ES')
  })

  it('switching to ES when no ES translation clears input', () => {
    renderApp(<SeriesTable series={[makeSeries()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('locale-tab-es'))
    expect(screen.getByTestId('edit-title-input')).toHaveValue('')
  })

  it('cancelling edit restores read mode', () => {
    renderApp(<SeriesTable series={[makeSeries()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('cancel-button'))
    expect(screen.queryByTestId('edit-title-input')).not.toBeInTheDocument()
    expect(screen.getByTestId('edit-button')).toBeInTheDocument()
  })

  it('saving edit calls PUT with locale and title', async () => {
    renderApp(<SeriesTable series={[makeSeries({ id: 'react-series' })]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.change(screen.getByTestId('edit-title-input'), {
      target: { value: 'React Series Updated' },
    })
    fireEvent.click(screen.getByTestId('save-button'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(axios.put).toHaveBeenCalledWith('/api/series/react-series', {
      locale: 'en',
      title: 'React Series Updated',
    })
    await waitFor(() =>
      expect(screen.queryByTestId('edit-title-input')).not.toBeInTheDocument(),
    )
  })

  it('saving ES locale sends correct locale', async () => {
    renderApp(
      <SeriesTable
        series={[
          makeSeries({
            translations: [
              { locale: 'en', title: 'My Series EN' },
              { locale: 'es', title: 'Mi Serie ES' },
            ],
          }),
        ]}
      />,
    )
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('locale-tab-es'))
    fireEvent.click(screen.getByTestId('save-button'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(axios.put).toHaveBeenCalledWith('/api/series/my-series', {
      locale: 'es',
      title: 'Mi Serie ES',
    })
  })

  it('delete button is disabled when postCount > 0', () => {
    renderApp(<SeriesTable series={[makeSeries({ postCount: 3 })]} />)
    expect(screen.getByTestId('delete-button')).toBeDisabled()
  })

  it('delete button shows tooltip with count when postCount > 0', () => {
    renderApp(<SeriesTable series={[makeSeries({ postCount: 3 })]} />)
    expect(screen.getByTestId('delete-button')).toHaveAttribute(
      'title',
      'Cannot delete — 3 post(s) use this series',
    )
  })

  it('delete button is enabled when postCount is 0', () => {
    renderApp(<SeriesTable series={[makeSeries({ postCount: 0 })]} />)
    expect(screen.getByTestId('delete-button')).not.toBeDisabled()
  })

  it('delete button has no title when postCount is 0', () => {
    renderApp(<SeriesTable series={[makeSeries({ postCount: 0 })]} />)
    expect(screen.getByTestId('delete-button')).not.toHaveAttribute('title')
  })

  it('delete opens modal and confirming calls DELETE and removes row', async () => {
    renderApp(
      <SeriesTable series={[makeSeries({ id: 'del-me', postCount: 0 })]} />,
    )
    fireEvent.click(screen.getByTestId('delete-button'))
    expect(screen.getByTestId('confirm-delete-confirm')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.delete).toHaveBeenCalled())
    expect(axios.delete).toHaveBeenCalledWith('/api/series/del-me')
    await waitFor(() =>
      expect(screen.queryByTestId('series-row')).not.toBeInTheDocument(),
    )
  })

  it('delete opens modal and cancelling does not call fetch', () => {
    renderApp(<SeriesTable series={[makeSeries({ postCount: 0 })]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(axios.delete).not.toHaveBeenCalled()
  })

  it('shows loading state while posts are being fetched', async () => {
    let resolveGet!: (v: unknown) => void
    jest.spyOn(axios, 'get').mockReturnValue(
      new Promise((res) => {
        resolveGet = res
      }) as never,
    )
    renderApp(<SeriesTable series={[makeSeries({ postCount: 1 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    expect(await screen.findByTestId('posts-loading')).toBeInTheDocument()
    resolveGet({ data: { data: [] } })
  })

  it('shows em dash for publication date when publishedAt is null', async () => {
    const mockPosts = [
      { id: 'post-abc', seriesOrder: 1, enTitle: 'My Post', publishedAt: null },
    ]
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { data: mockPosts } })
    renderApp(<SeriesTable series={[makeSeries({ postCount: 1 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    const item = await screen.findByTestId('series-post-item')
    expect(within(item).getByTestId('post-published-date')).toHaveTextContent(
      '—',
    )
  })

  it('shows formatted date when publishedAt is set', async () => {
    const mockPosts = [
      {
        id: 'post-abc',
        seriesOrder: 1,
        enTitle: 'My Post',
        publishedAt: '2025-03-15T00:00:00.000Z',
      },
    ]
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { data: mockPosts } })
    renderApp(<SeriesTable series={[makeSeries({ postCount: 1 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    const item = await screen.findByTestId('series-post-item')
    expect(
      within(item).getByTestId('post-published-date').textContent,
    ).not.toBe('—')
  })

  it('shows empty posts list when fetch fails', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('Network error'))
    renderApp(<SeriesTable series={[makeSeries({ postCount: 1 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    expect(await screen.findByTestId('posts-list')).toBeInTheDocument()
  })

  it('switching back to EN tab after ES restores EN title', () => {
    renderApp(
      <SeriesTable
        series={[
          makeSeries({
            translations: [
              { locale: 'en', title: 'My Series EN' },
              { locale: 'es', title: 'Mi Serie ES' },
            ],
          }),
        ]}
      />,
    )
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('locale-tab-es'))
    fireEvent.click(screen.getByTestId('locale-tab-en'))
    expect(screen.getByTestId('edit-title-input')).toHaveValue('My Series EN')
  })

  it('post count is not clickable when postCount is 0', () => {
    renderApp(<SeriesTable series={[makeSeries({ postCount: 0 })]} />)
    expect(screen.getByTestId('post-count')).not.toHaveAttribute(
      'data-clickable',
    )
    expect(screen.queryByTestId('expand-indicator')).not.toBeInTheDocument()
  })

  it('post count shows expand indicator when postCount > 0', () => {
    renderApp(<SeriesTable series={[makeSeries({ postCount: 3 })]} />)
    expect(screen.getByTestId('expand-indicator')).toBeInTheDocument()
  })

  it('clicking post count expands posts list', async () => {
    const mockPosts = [
      { id: 'post-1', seriesOrder: 1, enTitle: 'My Post', publishedAt: null },
    ]
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { data: mockPosts } })
    renderApp(<SeriesTable series={[makeSeries({ postCount: 1 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    expect(await screen.findByTestId('series-posts-row')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalledWith('/api/series/my-series/posts')
    expect(await screen.findByTestId('series-post-item')).toBeInTheDocument()
  })

  it('clicking post count again collapses the posts list', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: { data: [] } })
    renderApp(<SeriesTable series={[makeSeries({ postCount: 2 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    await screen.findByTestId('series-posts-row')
    fireEvent.click(screen.getByTestId('post-count'))
    expect(screen.queryByTestId('series-posts-row')).not.toBeInTheDocument()
  })

  it('expanded posts list shows post title and view/remove buttons', async () => {
    const mockPosts = [
      {
        id: 'post-abc',
        seriesOrder: 1,
        enTitle: 'My Post Title',
        publishedAt: null,
      },
    ]
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { data: mockPosts } })
    renderApp(<SeriesTable series={[makeSeries({ postCount: 1 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    const item = await screen.findByTestId('series-post-item')
    expect(within(item).getByText('My Post Title')).toBeInTheDocument()
    expect(within(item).getByTestId('view-post-button')).toBeInTheDocument()
    expect(
      within(item).getByTestId('remove-from-series-button'),
    ).toBeInTheDocument()
  })

  it('expanded posts list shows em dash when seriesOrder is null', async () => {
    const mockPosts = [
      { id: 'post-abc', seriesOrder: null, enTitle: null, publishedAt: null },
    ]
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { data: mockPosts } })
    renderApp(<SeriesTable series={[makeSeries({ postCount: 1 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    const item = await screen.findByTestId('series-post-item')
    expect(within(item).getAllByText('—').length).toBeGreaterThanOrEqual(1)
    expect(item.textContent).toContain('post-abc')
  })

  it('saving edit updates only the edited series', async () => {
    renderApp(
      <SeriesTable
        series={[
          makeSeries({
            id: 'a',
            translations: [{ locale: 'en', title: 'Series A' }],
          }),
          makeSeries({
            id: 'b',
            translations: [{ locale: 'en', title: 'Series B' }],
          }),
        ]}
      />,
    )
    fireEvent.click(screen.getAllByTestId('edit-button')[0])
    fireEvent.change(screen.getByTestId('edit-title-input'), {
      target: { value: 'Series A Updated' },
    })
    fireEvent.click(screen.getByTestId('save-button'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(screen.getByText('Series B')).toBeInTheDocument()
  })

  it('view post button navigates to admin post edit page', async () => {
    const mockPosts = [
      { id: 'post-abc', seriesOrder: 1, enTitle: 'My Post', publishedAt: null },
    ]
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { data: mockPosts } })
    renderApp(<SeriesTable series={[makeSeries({ postCount: 1 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    const item = await screen.findByTestId('series-post-item')
    fireEvent.click(within(item).getByTestId('view-post-button'))
    expect(mockPush).toHaveBeenCalledWith('/admin/posts/post-abc')
  })

  it('remove from series button calls PUT with null seriesId and seriesOrder', async () => {
    const mockPosts = [
      { id: 'post-abc', seriesOrder: 1, enTitle: 'My Post', publishedAt: null },
    ]
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { data: mockPosts } })
    renderApp(<SeriesTable series={[makeSeries({ postCount: 1 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    const item = await screen.findByTestId('series-post-item')
    fireEvent.click(within(item).getByTestId('remove-from-series-button'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(axios.put).toHaveBeenCalledWith('/api/posts/post-abc', {
      seriesId: null,
      seriesOrder: null,
    })
  })

  it('remove from series removes post from expanded list', async () => {
    const mockPosts = [
      { id: 'post-1', seriesOrder: 1, enTitle: 'Post 1', publishedAt: null },
      { id: 'post-2', seriesOrder: 2, enTitle: 'Post 2', publishedAt: null },
    ]
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { data: mockPosts } })
    renderApp(<SeriesTable series={[makeSeries({ postCount: 2 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    await screen.findAllByTestId('series-post-item')
    const items = screen.getAllByTestId('series-post-item')
    fireEvent.click(within(items[0]).getByTestId('remove-from-series-button'))
    await waitFor(() =>
      expect(screen.getAllByTestId('series-post-item')).toHaveLength(1),
    )
  })

  it('remove from series only decrements postCount for the correct series', async () => {
    const mockPosts = [
      { id: 'post-1', seriesOrder: 1, enTitle: 'Post 1', publishedAt: null },
    ]
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { data: mockPosts } })
    renderApp(
      <SeriesTable
        series={[
          makeSeries({ id: 'series-a', postCount: 1 }),
          makeSeries({ id: 'series-b', postCount: 2 }),
        ]}
      />,
    )
    fireEvent.click(screen.getAllByTestId('post-count')[0])
    const item = await screen.findByTestId('series-post-item')
    fireEvent.click(within(item).getByTestId('remove-from-series-button'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    const counts = screen.getAllByTestId('post-count')
    expect(counts[1]).toHaveTextContent('2')
  })

  it('remove last post from series collapses expanded row', async () => {
    const mockPosts = [
      {
        id: 'post-only',
        seriesOrder: 1,
        enTitle: 'Only Post',
        publishedAt: null,
      },
    ]
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { data: mockPosts } })
    renderApp(<SeriesTable series={[makeSeries({ postCount: 1 })]} />)
    fireEvent.click(screen.getByTestId('post-count'))
    const item = await screen.findByTestId('series-post-item')
    fireEvent.click(within(item).getByTestId('remove-from-series-button'))
    await waitFor(() =>
      expect(screen.queryByTestId('series-posts-row')).not.toBeInTheDocument(),
    )
  })
})

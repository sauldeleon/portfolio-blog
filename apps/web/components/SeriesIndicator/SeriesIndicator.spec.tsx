import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

const mockGetPostsBySeries = jest.fn()
const mockGetServerTranslation = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostsBySeries: (...args: unknown[]) => mockGetPostsBySeries(...args),
}))
jest.mock('@web/i18n/server', () => ({
  getServerTranslation: mockGetServerTranslation,
}))

const { SeriesIndicator } =
  require('./SeriesIndicator') as typeof import('./SeriesIndicator')

const mockSeriesPost = (overrides: Record<string, unknown> = {}) => ({
  id: '01JX001',
  title: 'Part One',
  slug: 'part-one',
  seriesId: 'my-series',
  seriesOrder: 1,
  status: 'published' as const,
  category: 'engineering',
  tags: [],
  author: 'Admin',
  coverImage: null,
  publishedAt: new Date('2024-01-01'),
  excerpt: 'Excerpt',
  content: '# Hello',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

beforeEach(() => {
  mockGetServerTranslation.mockResolvedValue({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) return `${key}(${JSON.stringify(params)})`
      return key
    },
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('SeriesIndicator', () => {
  it('returns null when series has no posts', async () => {
    mockGetPostsBySeries.mockResolvedValue([])
    const result = await SeriesIndicator({
      postId: '01JX001',
      seriesId: 'my-series',
      seriesOrder: 1,
      lng: 'en',
    })
    const { container } = renderApp(result)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders series heading', async () => {
    mockGetPostsBySeries.mockResolvedValue([mockSeriesPost()])
    const result = await SeriesIndicator({
      postId: '01JX002',
      seriesId: 'my-series',
      seriesOrder: null,
      lng: 'en',
    })
    renderApp(result)
    expect(screen.getByText(/seriesIndicator\.heading/)).toBeInTheDocument()
  })

  it('renders part label when seriesOrder is provided', async () => {
    mockGetPostsBySeries.mockResolvedValue([mockSeriesPost()])
    const result = await SeriesIndicator({
      postId: '01JX002',
      seriesId: 'my-series',
      seriesOrder: 2,
      lng: 'en',
    })
    renderApp(result)
    expect(screen.getByText(/seriesIndicator\.part/)).toBeInTheDocument()
  })

  it('does not render part label when seriesOrder is null', async () => {
    mockGetPostsBySeries.mockResolvedValue([mockSeriesPost()])
    const result = await SeriesIndicator({
      postId: '01JX002',
      seriesId: 'my-series',
      seriesOrder: null,
      lng: 'en',
    })
    renderApp(result)
    expect(screen.queryByText(/seriesIndicator\.part/)).not.toBeInTheDocument()
  })

  it('renders current post without link', async () => {
    mockGetPostsBySeries.mockResolvedValue([mockSeriesPost({ id: 'current' })])
    const result = await SeriesIndicator({
      postId: 'current',
      seriesId: 'my-series',
      seriesOrder: 1,
      lng: 'en',
    })
    renderApp(result)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Part One')).toBeInTheDocument()
  })

  it('renders other posts as links', async () => {
    mockGetPostsBySeries.mockResolvedValue([
      mockSeriesPost({ id: 'post-1', title: 'Part One', slug: 'part-one' }),
      mockSeriesPost({
        id: 'post-2',
        title: 'Part Two',
        slug: 'part-two',
        seriesOrder: 2,
      }),
    ])
    const result = await SeriesIndicator({
      postId: 'post-1',
      seriesId: 'my-series',
      seriesOrder: 1,
      lng: 'en',
    })
    renderApp(result)
    const link = screen.getByRole('link', { name: 'Part Two' })
    expect(link).toHaveAttribute('href', '/en/blog/post-2/part-two')
  })

  it('renders series order numbers when present', async () => {
    mockGetPostsBySeries.mockResolvedValue([
      mockSeriesPost({ id: 'p1', seriesOrder: 1 }),
    ])
    const result = await SeriesIndicator({
      postId: 'other',
      seriesId: 'my-series',
      seriesOrder: null,
      lng: 'en',
    })
    renderApp(result)
    expect(screen.getByText('1.')).toBeInTheDocument()
  })

  it('does not render order number when seriesOrder is null on post', async () => {
    mockGetPostsBySeries.mockResolvedValue([
      mockSeriesPost({ id: 'p1', seriesOrder: null }),
    ])
    const result = await SeriesIndicator({
      postId: 'other',
      seriesId: 'my-series',
      seriesOrder: null,
      lng: 'en',
    })
    renderApp(result)
    expect(screen.queryByText('1.')).not.toBeInTheDocument()
  })

  it('uses es locale', async () => {
    mockGetPostsBySeries.mockResolvedValue([mockSeriesPost()])
    const result = await SeriesIndicator({
      postId: 'other',
      seriesId: 'my-series',
      seriesOrder: 1,
      lng: 'es',
    })
    renderApp(result)
    expect(screen.getByText(/seriesIndicator\.heading/)).toBeInTheDocument()
  })

  it('renders multiple posts in order', async () => {
    mockGetPostsBySeries.mockResolvedValue([
      mockSeriesPost({ id: 'p1', title: 'First', seriesOrder: 1 }),
      mockSeriesPost({
        id: 'p2',
        title: 'Second',
        seriesOrder: 2,
        slug: 'second',
      }),
      mockSeriesPost({
        id: 'p3',
        title: 'Third',
        seriesOrder: 3,
        slug: 'third',
      }),
    ])
    const result = await SeriesIndicator({
      postId: 'p1',
      seriesId: 'my-series',
      seriesOrder: 1,
      lng: 'en',
    })
    renderApp(result)
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByText('First')).toBeInTheDocument()
  })
})

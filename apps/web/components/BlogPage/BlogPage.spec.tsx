import { render, screen } from '@testing-library/react'

import { Locale } from '@web/lib/db/schema'

const mockGetPublishedPostsPaginated = jest.fn()
const mockGetLatestPublishedPost = jest.fn()
const mockGetPostPublishedDates = jest.fn()
const mockGetCategories = jest.fn()
const mockGetCategoryByLocaleSlug = jest.fn()
const mockGetPostCountPerTag = jest.fn()
const mockGetServerTranslation = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPublishedPostsPaginated: mockGetPublishedPostsPaginated,
  getLatestPublishedPost: mockGetLatestPublishedPost,
  getPostPublishedDates: mockGetPostPublishedDates,
}))
jest.mock('@web/lib/db/queries/categories', () => ({
  getCategories: mockGetCategories,
  getCategoryByLocaleSlug: mockGetCategoryByLocaleSlug,
}))
jest.mock('@web/lib/db/queries/tags', () => ({
  getPostCountPerTag: mockGetPostCountPerTag,
}))
jest.mock('@web/i18n/server', () => ({
  getServerTranslation: mockGetServerTranslation,
}))
jest.mock('@sdlgr/post-card', () => ({
  PostCard: ({ title }: { title: string }) => (
    <article data-testid="post-card">{title}</article>
  ),
}))
jest.mock('@sdlgr/blog-filters', () => ({
  BlogFilters: () => <div data-testid="blog-filters" />,
}))
jest.mock('@sdlgr/pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}))
jest.mock('@web/components/LatestPostHero', () => ({
  LatestPostHero: () => <div data-testid="latest-post-hero" />,
}))
jest.mock('@web/components/SubscribeModal', () => ({
  SubscribeModal: () => <div data-testid="subscribe-modal" />,
}))

const { BlogPage, mergeDateCounts } =
  require('./BlogPage') as typeof import('./BlogPage')

const mockPost = {
  id: '01JWTEST000000000000000000',
  postNumber: 1,
  slug: 'test-post',
  title: 'Test Post',
  excerpt: 'Excerpt',
  content: 'Content',
  author: 'admin',
  publishedAt: '2024-06-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
  category: 'engineering',
  tags: ['react'],
  coverImage: null,
  coverImageFit: null,
  seriesId: null,
  seriesOrder: null,
  seriesTitle: null,
  status: 'published' as const,
}

const mockCategory = {
  id: 1,
  slug: 'engineering',
  name: 'Engineering',
  description: 'Posts about engineering',
  localeSlug: 'engineering',
  postCount: 5,
  publishedPostCount: 3,
}

function mockT(key: string) {
  return key
}

describe('BlogPage', () => {
  beforeEach(() => {
    mockGetServerTranslation.mockResolvedValue({ t: mockT })
    mockGetCategories.mockResolvedValue([mockCategory])
    mockGetCategoryByLocaleSlug.mockResolvedValue(null)
    mockGetPostCountPerTag.mockResolvedValue([])
    mockGetLatestPublishedPost.mockResolvedValue(null)
    mockGetPostPublishedDates.mockResolvedValue([])
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
  })

  it('renders post cards for each post', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({
      data: [mockPost, { ...mockPost, id: '02', title: 'Second Post' }],
      total: 2,
    })
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getAllByTestId('post-card')).toHaveLength(2)
    expect(screen.getByText('Test Post')).toBeInTheDocument()
  })

  it('renders empty state when no posts', async () => {
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByText('noResults')).toBeInTheDocument()
    expect(screen.queryByTestId('post-card')).toBeNull()
  })

  it('renders blog filters', async () => {
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByTestId('blog-filters')).toBeInTheDocument()
  })

  it('renders pagination', async () => {
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('renders hero when latest post exists', async () => {
    mockGetLatestPublishedPost.mockResolvedValue(mockPost)
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByTestId('latest-post-hero')).toBeInTheDocument()
  })

  it('renders hero even when filters are active', async () => {
    mockGetLatestPublishedPost.mockResolvedValue(mockPost)
    const ui = await BlogPage({
      lng: 'en',
      q: 'search term',
      categories: 'engineering',
      year: '2024',
    })
    render(ui)
    expect(screen.getByTestId('latest-post-hero')).toBeInTheDocument()
  })

  it('does not render hero when latest post is null', async () => {
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.queryByTestId('latest-post-hero')).toBeNull()
  })

  it('always calls getLatestPublishedPost regardless of filters', async () => {
    await BlogPage({
      lng: 'en',
      q: 'search',
      categories: 'engineering',
      year: '2024',
      month: '6',
    })
    expect(mockGetLatestPublishedPost).toHaveBeenCalled()
  })

  it('excludes latest post from grid query', async () => {
    mockGetLatestPublishedPost.mockResolvedValue(mockPost)
    await BlogPage({ lng: 'en' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ excludeId: mockPost.id }),
    )
  })

  it('passes excludeId=undefined when no latest post', async () => {
    await BlogPage({ lng: 'en' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ excludeId: undefined }),
    )
  })

  it('passes hero id to getPostCountPerTag', async () => {
    mockGetLatestPublishedPost.mockResolvedValue(mockPost)
    await BlogPage({ lng: 'en' })
    expect(mockGetPostCountPerTag).toHaveBeenCalledWith(
      mockPost.id,
      expect.objectContaining({ categories: [] }),
    )
  })

  it('passes undefined to getPostCountPerTag when no hero post', async () => {
    await BlogPage({ lng: 'en' })
    expect(mockGetPostCountPerTag).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ categories: [] }),
    )
  })

  it('passes hero id to getPostPublishedDates', async () => {
    mockGetLatestPublishedPost.mockResolvedValue(mockPost)
    await BlogPage({ lng: 'en' })
    expect(mockGetPostPublishedDates).toHaveBeenCalledWith('en', mockPost.id)
  })

  it('passes undefined to getPostPublishedDates when no hero post', async () => {
    await BlogPage({ lng: 'en' })
    expect(mockGetPostPublishedDates).toHaveBeenCalledWith('en', undefined)
  })

  it('passes hero id to getCategories', async () => {
    mockGetLatestPublishedPost.mockResolvedValue(mockPost)
    await BlogPage({ lng: 'en' })
    expect(mockGetCategories).toHaveBeenCalledWith(
      'en',
      mockPost.id,
      expect.objectContaining({ tags: [] }),
    )
  })

  it('passes undefined to getCategories when no hero post', async () => {
    await BlogPage({ lng: 'en' })
    expect(mockGetCategories).toHaveBeenCalledWith(
      'en',
      undefined,
      expect.objectContaining({ tags: [] }),
    )
  })

  it('passes active tags to getCategories filter', async () => {
    await BlogPage({ lng: 'en', tags: 'REACT,TYPESCRIPT' })
    expect(mockGetCategories).toHaveBeenCalledWith(
      'en',
      undefined,
      expect.objectContaining({ tags: ['REACT', 'TYPESCRIPT'] }),
    )
  })

  it('passes active year/month to getCategories filter', async () => {
    await BlogPage({ lng: 'en', year: '2024', month: '6' })
    expect(mockGetCategories).toHaveBeenCalledWith(
      'en',
      undefined,
      expect.objectContaining({ year: 2024, month: 6 }),
    )
  })

  it('passes canonical categories to getPostCountPerTag filter', async () => {
    mockGetCategoryByLocaleSlug.mockResolvedValue({
      canonicalSlug: 'engineering',
    })
    await BlogPage({ lng: 'en', categories: 'engineering' })
    expect(mockGetPostCountPerTag).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ categories: ['engineering'] }),
    )
  })

  it('passes active year/month to getPostCountPerTag filter', async () => {
    await BlogPage({ lng: 'en', year: '2024', month: '3' })
    expect(mockGetPostCountPerTag).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ year: 2024, month: 3 }),
    )
  })

  it('calls getPostPublishedDates once when no category or tag filters', async () => {
    await BlogPage({ lng: 'en' })
    expect(mockGetPostPublishedDates).toHaveBeenCalledTimes(1)
  })

  it('calls getPostPublishedDates twice when tag filter active', async () => {
    await BlogPage({ lng: 'en', tags: 'REACT' })
    expect(mockGetPostPublishedDates).toHaveBeenCalledTimes(2)
    expect(mockGetPostPublishedDates).toHaveBeenCalledWith('en', undefined)
    expect(mockGetPostPublishedDates).toHaveBeenCalledWith(
      'en',
      undefined,
      expect.objectContaining({ tags: ['REACT'] }),
    )
  })

  it('calls getPostPublishedDates twice when category filter active', async () => {
    mockGetCategoryByLocaleSlug.mockResolvedValue({
      canonicalSlug: 'engineering',
    })
    await BlogPage({ lng: 'en', categories: 'engineering' })
    expect(mockGetPostPublishedDates).toHaveBeenCalledTimes(2)
  })

  it('resolves locale slug to canonical and passes canonical to query', async () => {
    mockGetCategoryByLocaleSlug.mockResolvedValue({
      canonicalSlug: 'engineering',
    })
    await BlogPage({
      lng: 'en',
      categories: 'engineering',
      tags: 'react',
      page: '2',
    })
    expect(mockGetCategoryByLocaleSlug).toHaveBeenCalledWith(
      'engineering',
      'en',
    )
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'en',
        categories: ['engineering'],
        tags: ['react'],
        page: 2,
      }),
    )
  })

  it('falls back to raw locale slug when reverse-lookup returns null', async () => {
    await BlogPage({ lng: 'en', categories: 'unknown-cat' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ categories: ['unknown-cat'] }),
    )
  })

  it('passes undefined categories when no category filter', async () => {
    await BlogPage({ lng: 'en' })
    expect(mockGetCategoryByLocaleSlug).not.toHaveBeenCalled()
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ categories: undefined }),
    )
  })

  it('passes undefined tags when no tag filter', async () => {
    await BlogPage({ lng: 'en' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ tags: undefined }),
    )
  })

  it('defaults to page 1 when page param is missing', async () => {
    await BlogPage({ lng: 'en' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 }),
    )
  })

  it('defaults to page 1 when page param is non-numeric', async () => {
    await BlogPage({ lng: 'en', page: 'abc' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 }),
    )
  })

  it('parses year and month filter params', async () => {
    await BlogPage({ lng: 'en', year: '2024', month: '6' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2024, month: 6 }),
    )
  })

  it('treats non-numeric year and month as undefined in query', async () => {
    await BlogPage({ lng: 'en', year: 'abc', month: 'xyz' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ year: undefined, month: undefined }),
    )
  })

  it('falls back to enUS locale for unknown language', async () => {
    const ui = await BlogPage({ lng: 'fr' as unknown as Locale })
    render(ui)
    expect(screen.getByTestId('blog-filters')).toBeInTheDocument()
  })

  it('renders null publishedAt as null in PostCard', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({
      data: [{ ...mockPost, publishedAt: null }],
      total: 1,
    })
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByTestId('post-card')).toBeInTheDocument()
  })

  it('passes non-null coverImageFit through to PostCard', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({
      data: [{ ...mockPost, coverImageFit: 'cover' as const }],
      total: 1,
    })
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByTestId('post-card')).toBeInTheDocument()
  })
})

describe('mergeDateCounts', () => {
  const allDates = [
    {
      year: 2024,
      count: 5,
      months: [
        { month: 1, count: 2 },
        { month: 6, count: 3 },
      ],
    },
    {
      year: 2023,
      count: 4,
      months: [
        { month: 11, count: 2 },
        { month: 12, count: 2 },
      ],
    },
  ]

  it('returns filtered counts merged into all structure', () => {
    const filtered = [
      {
        year: 2024,
        count: 2,
        months: [
          { month: 1, count: 1 },
          { month: 6, count: 1 },
        ],
      },
    ]
    const result = mergeDateCounts(allDates, filtered)
    expect(result).toEqual([
      {
        year: 2024,
        count: 2,
        months: [
          { month: 1, count: 1 },
          { month: 6, count: 1 },
        ],
      },
      {
        year: 2023,
        count: 0,
        months: [
          { month: 11, count: 0 },
          { month: 12, count: 0 },
        ],
      },
    ])
  })

  it('shows 0 for years not in filtered result', () => {
    const result = mergeDateCounts(allDates, [])
    expect(result[0].count).toBe(0)
    expect(result[1].count).toBe(0)
    expect(result[0].months.every((m) => m.count === 0)).toBe(true)
    expect(result[1].months.every((m) => m.count === 0)).toBe(true)
  })

  it('shows 0 for months not in filtered result', () => {
    const filtered = [
      {
        year: 2024,
        count: 1,
        months: [{ month: 1, count: 1 }],
      },
    ]
    const result = mergeDateCounts(allDates, filtered)
    const year2024 = result.find((g) => g.year === 2024)!
    expect(year2024.months.find((m) => m.month === 1)?.count).toBe(1)
    expect(year2024.months.find((m) => m.month === 6)?.count).toBe(0)
  })

  it('returns empty array when all dates is empty', () => {
    const result = mergeDateCounts([], [{ year: 2024, count: 1, months: [] }])
    expect(result).toEqual([])
  })
})

export {}

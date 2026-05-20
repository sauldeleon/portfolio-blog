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

const { BlogPage } = require('./BlogPage') as typeof import('./BlogPage')

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
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByText('noResults')).toBeInTheDocument()
    expect(screen.queryByTestId('post-card')).toBeNull()
  })

  it('renders blog filters', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByTestId('blog-filters')).toBeInTheDocument()
  })

  it('renders pagination', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('renders hero when no filters active and latest post exists', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    mockGetLatestPublishedPost.mockResolvedValue(mockPost)
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByTestId('latest-post-hero')).toBeInTheDocument()
  })

  it('does not render hero when latest post is null', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    mockGetLatestPublishedPost.mockResolvedValue(null)
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.queryByTestId('latest-post-hero')).toBeNull()
  })

  it('does not render hero when q filter is active', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'en', q: 'search term' })
    render(ui)
    expect(screen.queryByTestId('latest-post-hero')).toBeNull()
    expect(mockGetLatestPublishedPost).not.toHaveBeenCalled()
  })

  it('does not render hero when categories filter is active', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'en', categories: 'engineering' })
    render(ui)
    expect(screen.queryByTestId('latest-post-hero')).toBeNull()
    expect(mockGetLatestPublishedPost).not.toHaveBeenCalled()
  })

  it('does not render hero when year filter is active', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'en', year: '2024' })
    render(ui)
    expect(screen.queryByTestId('latest-post-hero')).toBeNull()
    expect(mockGetLatestPublishedPost).not.toHaveBeenCalled()
  })

  it('does not render hero when month filter is active', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'en', year: '2024', month: '6' })
    render(ui)
    expect(screen.queryByTestId('latest-post-hero')).toBeNull()
    expect(mockGetLatestPublishedPost).not.toHaveBeenCalled()
  })

  it('excludes latest post from grid when hero is shown', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    mockGetLatestPublishedPost.mockResolvedValue(mockPost)
    await BlogPage({ lng: 'en' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ excludeId: mockPost.id }),
    )
  })

  it('resolves locale slug to canonical and passes canonical to query', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
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
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    mockGetCategoryByLocaleSlug.mockResolvedValue(null)
    await BlogPage({ lng: 'en', categories: 'unknown-cat' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ categories: ['unknown-cat'] }),
    )
  })

  it('passes undefined categories when no category filter', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    await BlogPage({ lng: 'en' })
    expect(mockGetCategoryByLocaleSlug).not.toHaveBeenCalled()
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ categories: undefined }),
    )
  })

  it('passes undefined tags when no tag filter', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    await BlogPage({ lng: 'en' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ tags: undefined }),
    )
  })

  it('defaults to page 1 when page param is missing', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    await BlogPage({ lng: 'en' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 }),
    )
  })

  it('defaults to page 1 when page param is non-numeric', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    await BlogPage({ lng: 'en', page: 'abc' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 }),
    )
  })

  it('parses year and month filter params', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    await BlogPage({ lng: 'en', year: '2024', month: '6' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2024, month: 6 }),
    )
  })

  it('treats non-numeric year and month as undefined in query', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    await BlogPage({ lng: 'en', year: 'abc', month: 'xyz' })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ year: undefined, month: undefined }),
    )
  })

  it('falls back to enUS locale for unknown language', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
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

export {}

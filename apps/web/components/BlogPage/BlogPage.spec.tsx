import { render, screen } from '@testing-library/react'

import { Locale } from '@web/lib/db/schema'

const mockGetPublishedPostsPaginated = jest.fn()
const mockGetCategories = jest.fn()
const mockGetPostCountPerTag = jest.fn()
const mockGetServerTranslation = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPublishedPostsPaginated: mockGetPublishedPostsPaginated,
}))
jest.mock('@web/lib/db/queries/categories', () => ({
  getCategories: mockGetCategories,
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
  CategoryFilter: () => <div data-testid="category-filter" />,
  TagFilter: () => <div data-testid="tag-filter" />,
}))
jest.mock('@sdlgr/pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}))

const { BlogPage } = require('./BlogPage') as typeof import('./BlogPage')

const mockPost = {
  id: '01JWTEST000000000000000000',
  slug: 'test-post',
  title: 'Test Post',
  excerpt: 'Excerpt',
  content: 'Content',
  author: 'admin',
  publishedAt: '2024-06-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
  readingTime: 2,
  category: 'engineering',
  tags: ['react'],
  coverImage: null,
}

function mockT(key: string) {
  return key
}

describe('BlogPage', () => {
  beforeEach(() => {
    mockGetServerTranslation.mockResolvedValue({ t: mockT })
    mockGetCategories.mockResolvedValue([
      {
        id: 1,
        slug: 'engineering',
        name: 'Engineering',
        description: 'Posts about engineering',
      },
    ])
    mockGetPostCountPerTag.mockResolvedValue([])
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

  it('renders category filter and tag filter', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByTestId('category-filter')).toBeInTheDocument()
    expect(screen.getByTestId('tag-filter')).toBeInTheDocument()
  })

  it('renders pagination', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('passes category and tag filters to query', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    await BlogPage({
      lng: 'en',
      category: 'engineering',
      tag: 'react',
      page: '2',
    })
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'en',
        category: 'engineering',
        tag: 'react',
        page: 2,
      }),
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

  it('falls back to enUS locale for unknown language', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'fr' as unknown as Locale })
    render(ui)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
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

  it('renders page heading', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    const ui = await BlogPage({ lng: 'en' })
    render(ui)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('title')
  })
})

export {}

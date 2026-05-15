import { render, screen } from '@testing-library/react'

const mockNotFound = jest.fn()
const mockRedirect = jest.fn()

jest.mock('next/navigation', () => ({
  notFound: mockNotFound,
  redirect: mockRedirect,
}))

const mockGetPostById = jest.fn()
const mockGetPublishedPosts = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostById: mockGetPostById,
  getPublishedPosts: mockGetPublishedPosts,
}))

const mockGetServerTranslation = jest.fn()
jest.mock('@web/i18n/server', () => ({
  getServerTranslation: mockGetServerTranslation,
}))

jest.mock('@sdlgr/post-hero', () => {
  const React = require('react')
  return {
    PostHero: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'post-hero' }),
      ),
  }
})

jest.mock('@sdlgr/table-of-contents', () => ({
  TableOfContents: ({ label }: { label: string }) => (
    <nav data-testid="toc">{label}</nav>
  ),
}))

jest.mock('@web/lib/mdx/renderMDX', () => ({
  renderMDX: jest.fn().mockReturnValue(null),
}))

jest.mock('@web/lib/mdx/remarkHeadings', () => ({
  extractToc: jest.fn().mockReturnValue([]),
}))

jest.mock('@web/components/RelatedPosts/RelatedPosts', () => ({
  RelatedPosts: () => <div data-testid="related-posts" />,
}))

jest.mock('@web/components/SeriesIndicator/SeriesIndicator', () => ({
  SeriesIndicator: () => <div data-testid="series-indicator" />,
}))

jest.mock('@web/utils/metadata/inLanguage', () => ({
  buildAlternates: jest
    .fn()
    .mockReturnValue({ canonical: 'https://test', languages: {} }),
  ogLocale: jest.fn().mockReturnValue('en_US'),
  ogLocaleAlternate: jest.fn().mockReturnValue(['es_ES']),
}))

jest.mock('date-fns', () => ({
  format: jest.fn().mockReturnValue('Jan 1, 2024'),
}))

const publishedPost = {
  id: '01JXYZ',
  slug: 'my-test-post',
  status: 'published' as const,
  title: 'My Test Post',
  excerpt: 'A great post about testing',
  coverImage: 'blog/cover',
  category: 'Tech',
  author: 'Jane Doe',
  publishedAt: new Date('2024-01-01'),
  content: 'Hello world content',
}

describe('[lng]/blog/[id]/[slug] - BlogPostPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerTranslation.mockResolvedValue({ t: (key: string) => key })
  })

  it('calls notFound when post is null', async () => {
    mockGetPostById.mockResolvedValue(null)
    const { default: BlogPostPage } = require('./page.next')
    await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: 'unknown', slug: 'unknown' }),
    })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('calls notFound when post status is draft', async () => {
    mockGetPostById.mockResolvedValue({ ...publishedPost, status: 'draft' })
    const { default: BlogPostPage } = require('./page.next')
    await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('calls redirect when slug does not match', async () => {
    mockGetPostById.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '01JXYZ', slug: 'wrong-slug' }),
    })
    expect(mockRedirect).toHaveBeenCalledWith('/en/blog/01JXYZ/my-test-post')
  })

  it('renders PostHero with correct props when valid', async () => {
    mockGetPostById.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.getByTestId('post-hero')).toBeInTheDocument()
  })

  it('renders RelatedPosts section', async () => {
    mockGetPostById.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.getByTestId('related-posts')).toBeInTheDocument()
  })

  it('renders SeriesIndicator when post has seriesId but no seriesOrder', async () => {
    mockGetPostById.mockResolvedValue({
      ...publishedPost,
      seriesId: 'my-series',
      seriesOrder: null,
    })
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.getByTestId('series-indicator')).toBeInTheDocument()
  })

  it('renders SeriesIndicator when post has a seriesId', async () => {
    mockGetPostById.mockResolvedValue({
      ...publishedPost,
      seriesId: 'my-series',
      seriesOrder: 1,
    })
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.getByTestId('series-indicator')).toBeInTheDocument()
  })

  it('does not render SeriesIndicator when post has no seriesId', async () => {
    mockGetPostById.mockResolvedValue({ ...publishedPost, seriesId: null })
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.queryByTestId('series-indicator')).not.toBeInTheDocument()
  })

  it('renders TOC when entries exist', async () => {
    const { extractToc } = require('@web/lib/mdx/remarkHeadings')
    extractToc.mockReturnValue([{ depth: 2, text: 'Intro', id: 'intro' }])
    mockGetPostById.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.getByTestId('toc')).toBeInTheDocument()
  })

  it('does not render TOC when no entries', async () => {
    const { extractToc } = require('@web/lib/mdx/remarkHeadings')
    extractToc.mockReturnValue([])
    mockGetPostById.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.queryByTestId('toc')).not.toBeInTheDocument()
  })

  it('handles publishedAt null', async () => {
    mockGetPostById.mockResolvedValue({ ...publishedPost, publishedAt: null })
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.getByTestId('post-hero')).toBeInTheDocument()
  })

  it('falls back to enUS locale for unknown language', async () => {
    mockGetPostById.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'fr',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.getByTestId('post-hero')).toBeInTheDocument()
  })

  it('generateStaticParams returns entries for both locales', async () => {
    mockGetPublishedPosts.mockResolvedValue([{ id: '01', slug: 'test-post' }])
    const { generateStaticParams } = require('./page.next')
    const params = await generateStaticParams()
    expect(params).toEqual([
      { lng: 'en', id: '01', slug: 'test-post' },
      { lng: 'es', id: '01', slug: 'test-post' },
    ])
  })

  it('generateStaticParams returns empty array when DB fails', async () => {
    mockGetPublishedPosts.mockRejectedValue(new Error('no db'))
    const { generateStaticParams } = require('./page.next')
    const params = await generateStaticParams()
    expect(params).toEqual([])
  })

  describe('generateMetadata', () => {
    it('returns empty object when post not found', async () => {
      mockGetPostById.mockResolvedValue(null)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: 'unknown', slug: 'x' }),
      })
      expect(meta).toEqual({})
    })

    it('returns empty object when post is draft', async () => {
      mockGetPostById.mockResolvedValue({ ...publishedPost, status: 'draft' })
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '01JXYZ', slug: 'x' }),
      })
      expect(meta).toEqual({})
    })

    it('returns title and description for published post', async () => {
      mockGetPostById.mockResolvedValue(publishedPost)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({
          lng: 'en',
          id: '01JXYZ',
          slug: 'my-test-post',
        }),
      })
      expect(meta.title).toBe('My Test Post')
      expect(meta.description).toBe('A great post about testing')
    })

    it('uses alt post slug when available', async () => {
      mockGetPostById
        .mockResolvedValueOnce(publishedPost)
        .mockResolvedValueOnce({ ...publishedPost, slug: 'mi-post-de-prueba' })
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({
          lng: 'en',
          id: '01JXYZ',
          slug: 'my-test-post',
        }),
      })
      expect(meta.alternates.languages['es-ES']).toContain('mi-post-de-prueba')
    })

    it('falls back to own slug when alt post not found', async () => {
      mockGetPostById
        .mockResolvedValueOnce(publishedPost)
        .mockResolvedValueOnce(null)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({
          lng: 'en',
          id: '01JXYZ',
          slug: 'my-test-post',
        }),
      })
      expect(meta.alternates.languages['es-ES']).toContain('my-test-post')
    })

    it('generates correct alternates for es locale', async () => {
      mockGetPostById
        .mockResolvedValueOnce({ ...publishedPost, slug: 'mi-post' })
        .mockResolvedValueOnce(publishedPost)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'es', id: '01JXYZ', slug: 'mi-post' }),
      })
      expect(meta.title).toBe('My Test Post')
    })
  })
})

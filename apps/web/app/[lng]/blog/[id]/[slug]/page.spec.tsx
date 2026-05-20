import { render, screen } from '@testing-library/react'

const mockNotFound = jest.fn()
const mockRedirect = jest.fn()

jest.mock('next/navigation', () => ({
  notFound: mockNotFound,
  redirect: mockRedirect,
}))

const mockGetPostByNumber = jest.fn()
const mockGetPublishedPosts = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostByNumber: mockGetPostByNumber,
  getPublishedPosts: mockGetPublishedPosts,
}))

const mockGetCategoryTranslations = jest.fn()

jest.mock('@web/lib/db/queries/categories', () => ({
  getCategoryTranslations: mockGetCategoryTranslations,
}))

const mockGetServerTranslation = jest.fn()
jest.mock('@web/i18n/server', () => ({
  getServerTranslation: mockGetServerTranslation,
}))

const mockPostHero = jest.fn()

jest.mock('@sdlgr/post-hero', () => ({
  PostHero: (...args: unknown[]) => mockPostHero(...args),
}))

jest.mock('@sdlgr/table-of-contents', () => ({
  TableOfContents: ({ label }: { label: string }) => (
    <nav data-testid="toc">{label}</nav>
  ),
}))

jest.mock('next-cloudinary', () => ({
  getCldImageUrl: jest.fn(
    ({ src }: { src: string }) =>
      `https://res.cloudinary.com/test/image/upload/${src}`,
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

jest.mock('@web/lib/seo/generateArticleJsonLd', () => ({
  generateArticleJsonLd: jest.fn().mockReturnValue({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Test',
  }),
}))

jest.mock('@web/components/JsonLd/JsonLd', () => ({
  JsonLd: () => <script data-testid="json-ld" type="application/ld+json" />,
}))

jest.mock('date-fns', () => ({
  format: jest.fn().mockReturnValue('Jan 1, 2024'),
}))

jest.mock('./page.next.styles', () => ({
  StyledPage: ({ children }: { children: React.ReactNode }) => (
    <main data-testid="styled-page">{children}</main>
  ),
}))

jest.mock('@web/components/PostContent/PostContent', () => ({
  PostContent: ({ children }: { children: React.ReactNode }) => (
    <article data-testid="styled-article">{children}</article>
  ),
}))

const publishedPost = {
  id: '01JXYZ',
  postNumber: 1,
  slug: 'my-test-post',
  status: 'published' as const,
  title: 'My Test Post',
  excerpt: 'A great post about testing',
  coverImage: 'blog/cover',
  coverImageFit: 'cover' as const,
  category: 'Tech',
  tags: ['next.js', 'react'],
  author: 'Jane Doe',
  publishedAt: new Date('2024-01-01'),
  content: 'Hello world content',
  seriesId: null,
  seriesOrder: null,
  seriesTitle: null,
}

describe('[lng]/blog/[id]/[slug] - BlogPostPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPostHero.mockReturnValue(<div data-testid="post-hero" />)
    mockGetServerTranslation.mockResolvedValue({ t: (key: string) => key })
    mockGetCategoryTranslations.mockResolvedValue([
      {
        locale: 'en',
        name: 'Technology',
        categorySlug: 'tech',
        slug: 'technology',
        description: null,
      },
      {
        locale: 'es',
        name: 'Tecnología',
        categorySlug: 'tech',
        slug: 'tecnologia',
        description: null,
      },
    ])
  })

  it('calls notFound when id is not a number', async () => {
    const { default: BlogPostPage } = require('./page.next')
    await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: 'not-a-number', slug: 'x' }),
    })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
    expect(mockGetPostByNumber).not.toHaveBeenCalled()
  })

  it('calls notFound when post is null', async () => {
    mockGetPostByNumber.mockResolvedValue(null)
    const { default: BlogPostPage } = require('./page.next')
    await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'unknown' }),
    })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('calls notFound when post status is draft', async () => {
    mockGetPostByNumber.mockResolvedValue({ ...publishedPost, status: 'draft' })
    const { default: BlogPostPage } = require('./page.next')
    await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('calls redirect when slug does not match', async () => {
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'wrong-slug' }),
    })
    expect(mockRedirect).toHaveBeenCalledWith('/en/blog/1/my-test-post')
  })

  it('renders PostHero with correct props when valid', async () => {
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.getByTestId('post-hero')).toBeInTheDocument()
  })

  it('passes url and share labels to PostHero', async () => {
    process.env.BASE_URL = 'https://example.com'
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    const PostHero = mockPostHero
    expect(PostHero).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://example.com/en/blog/1/my-test-post',
        shareLabel: 'share',
        copyLinkLabel: 'share.copyLink',
        copiedLabel: 'share.copied',
      }),
      undefined,
    )
    delete process.env.BASE_URL
  })

  it('renders RelatedPosts section', async () => {
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.getByTestId('related-posts')).toBeInTheDocument()
  })

  it('renders JSON-LD script tag', async () => {
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.getByTestId('json-ld')).toBeInTheDocument()
  })

  it('renders SeriesIndicator when post has seriesId but no seriesOrder', async () => {
    mockGetPostByNumber.mockResolvedValue({
      ...publishedPost,
      seriesId: 'my-series',
      seriesOrder: null,
    })
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.getByTestId('series-indicator')).toBeInTheDocument()
  })

  it('renders SeriesIndicator when post has a seriesId', async () => {
    mockGetPostByNumber.mockResolvedValue({
      ...publishedPost,
      seriesId: 'my-series',
      seriesOrder: 1,
    })
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.getByTestId('series-indicator')).toBeInTheDocument()
  })

  it('does not render SeriesIndicator when post has no seriesId', async () => {
    mockGetPostByNumber.mockResolvedValue({ ...publishedPost, seriesId: null })
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.queryByTestId('series-indicator')).not.toBeInTheDocument()
  })

  it('renders TOC when entries exist', async () => {
    const { extractToc } = require('@web/lib/mdx/remarkHeadings')
    extractToc.mockReturnValue([{ depth: 2, text: 'Intro', id: 'intro' }])
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.getByTestId('toc')).toBeInTheDocument()
  })

  it('does not render TOC when no entries', async () => {
    const { extractToc } = require('@web/lib/mdx/remarkHeadings')
    extractToc.mockReturnValue([])
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.queryByTestId('toc')).not.toBeInTheDocument()
  })

  it('handles publishedAt null', async () => {
    mockGetPostByNumber.mockResolvedValue({
      ...publishedPost,
      publishedAt: null,
    })
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.getByTestId('post-hero')).toBeInTheDocument()
  })

  it('falls back to enUS locale for unknown language', async () => {
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'fr', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.getByTestId('post-hero')).toBeInTheDocument()
  })

  it('generateStaticParams returns entries for both locales', async () => {
    mockGetPublishedPosts.mockResolvedValue([
      { id: '01JXYZ', postNumber: 5, slug: 'test-post' },
    ])
    const { generateStaticParams } = require('./page.next')
    const params = await generateStaticParams()
    expect(params).toEqual([
      { lng: 'en', id: '5', slug: 'test-post' },
      { lng: 'es', id: '5', slug: 'test-post' },
    ])
  })

  it('generateStaticParams returns empty array when DB fails', async () => {
    mockGetPublishedPosts.mockRejectedValue(new Error('no db'))
    const { generateStaticParams } = require('./page.next')
    const params = await generateStaticParams()
    expect(params).toEqual([])
  })

  describe('generateMetadata', () => {
    it('returns empty object when id is not a number', async () => {
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: 'not-a-number', slug: 'x' }),
      })
      expect(meta).toEqual({})
    })

    it('returns empty object when post not found', async () => {
      mockGetPostByNumber.mockResolvedValue(null)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '1', slug: 'x' }),
      })
      expect(meta).toEqual({})
    })

    it('returns empty object when post is draft', async () => {
      mockGetPostByNumber.mockResolvedValue({
        ...publishedPost,
        status: 'draft',
      })
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '1', slug: 'x' }),
      })
      expect(meta).toEqual({})
    })

    it('returns title and description for published post', async () => {
      mockGetPostByNumber.mockResolvedValue(publishedPost)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
      })
      expect(meta.title).toBe('My Test Post')
      expect(meta.description).toBe('A great post about testing')
    })

    it('uses alt post slug when available', async () => {
      mockGetPostByNumber
        .mockResolvedValueOnce(publishedPost)
        .mockResolvedValueOnce({ ...publishedPost, slug: 'mi-post-de-prueba' })
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
      })
      expect(meta.alternates.languages['es-ES']).toContain('mi-post-de-prueba')
    })

    it('falls back to own slug when alt post not found', async () => {
      mockGetPostByNumber
        .mockResolvedValueOnce(publishedPost)
        .mockResolvedValueOnce(null)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
      })
      expect(meta.alternates.languages['es-ES']).toContain('my-test-post')
    })

    it('generates correct alternates for es locale', async () => {
      mockGetPostByNumber
        .mockResolvedValueOnce({ ...publishedPost, slug: 'mi-post' })
        .mockResolvedValueOnce(publishedPost)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'es', id: '1', slug: 'mi-post' }),
      })
      expect(meta.title).toBe('My Test Post')
    })

    it('includes OG image URL with title in openGraph', async () => {
      mockGetPostByNumber.mockResolvedValue(publishedPost)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
      })
      expect(meta.openGraph.images[0].url).toContain('/og?')
      expect(meta.openGraph.images[0].url).toContain('title=My+Test+Post')
      expect(meta.openGraph.images[0]).toMatchObject({
        width: 1200,
        height: 630,
      })
    })

    it('includes cover in OG image URL when post has coverImage', async () => {
      mockGetPostByNumber.mockResolvedValue({
        ...publishedPost,
        coverImage: 'blog/my-cover.jpg',
      })
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
      })
      expect(meta.openGraph.images[0].url).toContain('cover=')
    })

    it('includes twitter card metadata', async () => {
      mockGetPostByNumber.mockResolvedValue(publishedPost)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
      })
      expect(meta.twitter.card).toBe('summary_large_image')
      expect(meta.twitter.images[0]).toContain('/og?')
    })

    it('does not include cover in OG URL when post has no coverImage', async () => {
      mockGetPostByNumber.mockResolvedValue({
        ...publishedPost,
        coverImage: null,
      })
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
      })
      expect(meta.openGraph.images[0].url).not.toContain('cover=')
    })

    it('does not include category in OG URL when post has empty category', async () => {
      mockGetPostByNumber.mockResolvedValue({
        ...publishedPost,
        category: '',
      })
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
      })
      expect(meta.openGraph.images[0].url).not.toContain('category=')
    })

    it('uses translated category name in OG URL', async () => {
      mockGetPostByNumber.mockResolvedValue(publishedPost)
      const { generateMetadata } = require('./page.next')
      const meta = await generateMetadata({
        params: Promise.resolve({ lng: 'es', id: '1', slug: 'my-test-post' }),
      })
      expect(meta.openGraph.images[0].url).toContain('category=Tecnolog')
    })
  })

  it('passes translated category name to PostHero', async () => {
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'es', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    const PostHero = mockPostHero
    expect(PostHero).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Tecnología' }),
      undefined,
    )
  })

  it('falls back to EN category name when locale translation is missing', async () => {
    mockGetCategoryTranslations.mockResolvedValue([
      {
        locale: 'en',
        name: 'Technology',
        categorySlug: 'tech',
        slug: 'technology',
        description: null,
      },
    ])
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'es', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    const PostHero = mockPostHero
    expect(PostHero).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Technology' }),
      undefined,
    )
  })

  it('falls back to category slug when no translations exist', async () => {
    mockGetCategoryTranslations.mockResolvedValue([])
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    const PostHero = mockPostHero
    expect(PostHero).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Tech' }),
      undefined,
    )
  })

  it('uses empty string for postUrl when BASE_URL is not set', async () => {
    const originalBaseUrl = process.env.BASE_URL
    delete process.env.BASE_URL
    mockGetPostByNumber.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '1', slug: 'my-test-post' }),
    })
    render(ui)
    expect(screen.getByTestId('json-ld')).toBeInTheDocument()
    process.env.BASE_URL = originalBaseUrl
  })
})

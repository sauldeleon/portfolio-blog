import type { PublicPost } from '@web/lib/db/queries/posts'

import { generateArticleJsonLd } from './generateArticleJsonLd'

jest.mock('next-cloudinary', () => ({
  getCldImageUrl: jest.fn(
    ({ src }: { src: string }) =>
      `https://res.cloudinary.com/test/image/upload/${src}`,
  ),
}))

const mockPost: PublicPost = {
  id: '01ABC',
  slug: 'test-post',
  title: 'Test Post Title',
  excerpt: 'A great post excerpt',
  category: 'Engineering',
  tags: ['react', 'typescript'],
  status: 'published',
  coverImage: 'blog/cover.jpg',
  coverImageFit: 'cover',
  seriesId: null,
  seriesOrder: null,
  seriesTitle: null,
  publishedAt: new Date('2024-01-15T12:00:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-20T12:00:00Z'),
  author: 'Saúl de León',
}

const testUrl = 'https://www.sawl.dev/en/blog/01ABC/test-post'

describe('generateArticleJsonLd', () => {
  const originalBaseUrl = process.env.BASE_URL

  beforeEach(() => {
    process.env.BASE_URL = 'https://www.sawl.dev'
  })

  afterEach(() => {
    process.env.BASE_URL = originalBaseUrl
  })

  it('sets @context to https://schema.org', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result['@context']).toBe('https://schema.org')
  })

  it('sets @type to Article', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result['@type']).toBe('Article')
  })

  it('sets headline from post title', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.headline).toBe('Test Post Title')
  })

  it('sets description from post excerpt', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.description).toBe('A great post excerpt')
  })

  it('includes coverImage as full Cloudinary URL when present', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.image).toBe(
      'https://res.cloudinary.com/test/image/upload/blog/cover.jpg',
    )
  })

  it('sets image to undefined when coverImage is null', () => {
    const result = generateArticleJsonLd(
      { ...mockPost, coverImage: null },
      'en',
      testUrl,
    )
    expect(result.image).toBeUndefined()
  })

  it('sets datePublished from post publishedAt', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.datePublished).toEqual(new Date('2024-01-15T12:00:00Z'))
  })

  it('sets dateModified from post updatedAt', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.dateModified).toEqual(new Date('2024-01-20T12:00:00Z'))
  })

  it('sets author with Person type and post author name', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.author).toEqual({
      '@type': 'Person',
      name: 'Saúl de León',
      url: 'https://www.sawl.dev',
    })
  })

  it('sets publisher with Person type', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.publisher).toEqual({
      '@type': 'Person',
      name: 'Saúl de León',
      url: 'https://www.sawl.dev',
    })
  })

  it('sets mainEntityOfPage with the provided url', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': testUrl,
    })
  })

  it('sets inLanguage to en-US for EN locale', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.inLanguage).toBe('en-US')
  })

  it('sets inLanguage to es-ES for ES locale', () => {
    const result = generateArticleJsonLd(mockPost, 'es', testUrl)
    expect(result.inLanguage).toBe('es-ES')
  })

  it('sets inLanguage to es-ES for unknown locale', () => {
    const result = generateArticleJsonLd(mockPost, 'fr', testUrl)
    expect(result.inLanguage).toBe('es-ES')
  })

  it('joins tags as comma-separated keywords', () => {
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.keywords).toBe('react, typescript')
  })

  it('returns empty string keywords when tags is empty', () => {
    const result = generateArticleJsonLd(
      { ...mockPost, tags: [] },
      'en',
      testUrl,
    )
    expect(result.keywords).toBe('')
  })

  it('uses empty string for siteUrl when neither BASE_URL nor VERCEL_URL is set', () => {
    delete process.env.BASE_URL
    delete process.env.VERCEL_URL
    const result = generateArticleJsonLd(mockPost, 'en', testUrl)
    expect(result.author).toMatchObject({ url: '' })
    expect(result.publisher).toMatchObject({ url: '' })
  })
})

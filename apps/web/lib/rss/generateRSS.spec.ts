import type { PublicPost } from '@web/lib/db/queries/posts'

import { generateRSS } from './generateRSS'

const mockPost: PublicPost = {
  id: '01ABC',
  postNumber: 1,
  slug: 'test-post',
  title: 'Test Post',
  excerpt: 'A great post',
  category: 'Engineering',
  tags: ['react', 'typescript'],
  status: 'published',
  coverImage: null,
  coverImageFit: null,
  seriesId: null,
  seriesOrder: null,
  seriesTitle: null,
  publishedAt: new Date('2024-01-15T12:00:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-15T12:00:00Z'),
  author: 'Saúl de León',
}

describe('generateRSS', () => {
  const originalBaseUrl = process.env.BASE_URL

  beforeEach(() => {
    process.env.BASE_URL = 'https://www.sawl.dev'
  })

  afterEach(() => {
    process.env.BASE_URL = originalBaseUrl
  })

  it('generates valid RSS 2.0 XML declaration', () => {
    const rss = generateRSS([mockPost], 'en')
    expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(rss).toContain('<rss version="2.0"')
  })

  it('generates EN language tag', () => {
    const rss = generateRSS([mockPost], 'en')
    expect(rss).toContain('<language>en</language>')
  })

  it('generates ES language tag', () => {
    const rss = generateRSS([mockPost], 'es')
    expect(rss).toContain('<language>es</language>')
  })

  it('includes post title', () => {
    const rss = generateRSS([mockPost], 'en')
    expect(rss).toContain('<title><![CDATA[Test Post]]></title>')
  })

  it('includes EN post URL', () => {
    const rss = generateRSS([mockPost], 'en')
    expect(rss).toContain('https://www.sawl.dev/en/blog/1/test-post')
  })

  it('includes ES post URL', () => {
    const rss = generateRSS([mockPost], 'es')
    expect(rss).toContain('https://www.sawl.dev/es/blog/1/test-post')
  })

  it('includes EN feed self-link', () => {
    const rss = generateRSS([mockPost], 'en')
    expect(rss).toContain('href="https://www.sawl.dev/feed.xml"')
  })

  it('includes ES feed self-link', () => {
    const rss = generateRSS([mockPost], 'es')
    expect(rss).toContain('href="https://www.sawl.dev/feed.es.xml"')
  })

  it('includes post category', () => {
    const rss = generateRSS([mockPost], 'en')
    expect(rss).toContain('<category><![CDATA[Engineering]]></category>')
  })

  it('includes post excerpt as description', () => {
    const rss = generateRSS([mockPost], 'en')
    expect(rss).toContain('<description><![CDATA[A great post]]></description>')
  })

  it('includes pubDate for post with publishedAt', () => {
    const rss = generateRSS([mockPost], 'en')
    expect(rss).toContain('<pubDate>')
    expect(rss).not.toContain('<pubDate></pubDate>')
  })

  it('renders empty pubDate when publishedAt is null', () => {
    const postWithNullDate = { ...mockPost, publishedAt: null }
    const rss = generateRSS([postWithNullDate], 'en')
    expect(rss).toContain('<pubDate></pubDate>')
  })

  it('generates empty items section when no posts', () => {
    const rss = generateRSS([], 'en')
    expect(rss).not.toContain('<item>')
    expect(rss).toContain('<channel>')
  })

  it('generates correct EN blog channel link', () => {
    const rss = generateRSS([mockPost], 'en')
    expect(rss).toContain('<link>https://www.sawl.dev/en/blog</link>')
  })

  it('generates correct ES blog channel link', () => {
    const rss = generateRSS([mockPost], 'es')
    expect(rss).toContain('<link>https://www.sawl.dev/es/blog</link>')
  })

  it('uses empty string as base when BASE_URL is not set', () => {
    delete process.env.BASE_URL
    const rss = generateRSS([mockPost], 'en')
    expect(rss).toContain('/en/blog/1/test-post')
  })

  it('generates multiple items', () => {
    const post2 = {
      ...mockPost,
      id: '02DEF',
      postNumber: 2,
      slug: 'second-post',
      title: 'Second Post',
    }
    const rss = generateRSS([mockPost, post2], 'en')
    expect(rss).toContain('1/test-post')
    expect(rss).toContain('2/second-post')
  })
})

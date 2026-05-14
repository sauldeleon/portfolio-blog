const mockGetPublishedPosts = jest.fn()
jest.mock('@web/lib/db/queries/posts', () => ({
  getPublishedPosts: mockGetPublishedPosts,
}))

const mockPost = {
  id: '01JWTEST000000000000000000',
  slug: 'test-post',
  title: 'Test Post',
  excerpt: 'An excerpt',
  author: 'Author',
  publishedAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-02-01'),
  category: 'engineering',
  tags: [],
  coverImage: null,
  status: 'published' as const,
  seriesId: null,
  seriesOrder: null,
  createdAt: new Date('2024-01-01'),
}

describe('sitemap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate sitemap with static routes when no posts', async () => {
    mockGetPublishedPosts.mockResolvedValue([])
    const sitemap = (await import('./sitemap')).default
    const result = await sitemap()
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/en/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/en/contact/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/en/experience/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/en/portfolio/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/es/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/es/contact/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/es/experience/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/es/portfolio/",
        },
      ]
    `)
  })

  it('includes blog post routes for each locale', async () => {
    mockGetPublishedPosts.mockResolvedValue([mockPost])
    jest.resetModules()
    const sitemap = (await import('./sitemap')).default
    const result = await sitemap()
    const urls = result.map((r) => r.url)
    expect(urls).toContain(
      'https://test.url/en/blog/01JWTEST000000000000000000/test-post',
    )
    expect(urls).toContain(
      'https://test.url/es/blog/01JWTEST000000000000000000/test-post',
    )
  })

  it('uses post updatedAt as lastModified for blog routes', async () => {
    mockGetPublishedPosts.mockResolvedValue([mockPost])
    jest.resetModules()
    const sitemap = (await import('./sitemap')).default
    const result = await sitemap()
    const blogRoute = result.find((r) => r.url.includes('/blog/'))
    expect(blogRoute?.lastModified).toEqual(new Date('2024-02-01'))
  })

  it('falls back to LAST_MODIFIED when post has no updatedAt', async () => {
    const postWithoutUpdatedAt = {
      ...mockPost,
      updatedAt: null as unknown as Date,
    }
    mockGetPublishedPosts.mockResolvedValue([postWithoutUpdatedAt])
    jest.resetModules()
    const sitemap = (await import('./sitemap')).default
    const result = await sitemap()
    const blogRoute = result.find((r) => r.url.includes('/blog/'))
    expect(blogRoute?.lastModified).toBe('2026-05-11T00:00:00.000Z')
  })

  it('falls back to static routes when DB throws', async () => {
    mockGetPublishedPosts.mockRejectedValue(new Error('db error'))
    jest.resetModules()
    const sitemap = (await import('./sitemap')).default
    const result = await sitemap()
    expect(result).toHaveLength(8)
    expect(result.every((r) => !r.url.includes('/blog/'))).toBe(true)
  })
})

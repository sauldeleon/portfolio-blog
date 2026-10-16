/**
 * @vitest-environment node
 */
const mockGetPublishedPosts = vi.fn()
const mockGenerateRSS = vi.fn()

vi.mock('@web/lib/db/queries/publicCache', () => ({
  getCachedPublishedPosts: mockGetPublishedPosts,
}))

vi.mock('@web/lib/rss/generateRSS', () => ({
  generateRSS: mockGenerateRSS,
}))

describe('GET /feed.xml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPublishedPosts.mockResolvedValue([])
    mockGenerateRSS.mockReturnValue('<rss>EN feed</rss>')
  })

  it('returns response with RSS content-type header', async () => {
    const { GET } = await import('./route')
    const response = await GET()
    expect(response.headers.get('Content-Type')).toBe(
      'application/rss+xml; charset=utf-8',
    )
  })

  it('requests the latest 20 en posts in SQL', async () => {
    const { GET } = await import('./route')
    await GET()
    expect(mockGetPublishedPosts).toHaveBeenCalledWith('en', { limit: 20 })
  })

  it('passes the posts to generateRSS', async () => {
    const posts = [
      { id: '1', slug: 'post-1' },
      { id: '2', slug: 'post-2' },
    ]
    mockGetPublishedPosts.mockResolvedValue(posts)
    const { GET } = await import('./route')
    await GET()
    expect(mockGenerateRSS).toHaveBeenCalledWith(posts, 'en')
  })

  it('returns the RSS content in the body', async () => {
    const { GET } = await import('./route')
    const response = await GET()
    const text = await response.text()
    expect(text).toBe('<rss>EN feed</rss>')
  })
})

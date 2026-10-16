/**
 * @vitest-environment node
 */
const mockGetPublishedPosts = vi.fn()
const mockGenerateRSS = vi.fn()

vi.mock('@web/lib/db/queries/posts', () => ({
  getPublishedPosts: mockGetPublishedPosts,
}))

vi.mock('@web/lib/rss/generateRSS', () => ({
  generateRSS: mockGenerateRSS,
}))

describe('GET /feed.es.xml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPublishedPosts.mockResolvedValue([])
    mockGenerateRSS.mockReturnValue('<rss>ES feed</rss>')
  })

  it('returns response with RSS content-type header', async () => {
    const { GET } = await import('./route')
    const response = await GET()
    expect(response.headers.get('Content-Type')).toBe(
      'application/rss+xml; charset=utf-8',
    )
  })

  it('calls getPublishedPosts with es locale', async () => {
    const { GET } = await import('./route')
    await GET()
    expect(mockGetPublishedPosts).toHaveBeenCalledWith('es')
  })

  it('passes first 20 posts to generateRSS with es locale', async () => {
    const posts = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      slug: `post-${i}`,
    }))
    mockGetPublishedPosts.mockResolvedValue(posts)
    const { GET } = await import('./route')
    await GET()
    expect(mockGenerateRSS).toHaveBeenCalledWith(posts.slice(0, 20), 'es')
  })

  it('passes all posts when fewer than 20', async () => {
    const posts = [{ id: '1', slug: 'post-1' }]
    mockGetPublishedPosts.mockResolvedValue(posts)
    const { GET } = await import('./route')
    await GET()
    expect(mockGenerateRSS).toHaveBeenCalledWith(posts, 'es')
  })

  it('returns the RSS content in the body', async () => {
    const { GET } = await import('./route')
    const response = await GET()
    const text = await response.text()
    expect(text).toBe('<rss>ES feed</rss>')
  })
})

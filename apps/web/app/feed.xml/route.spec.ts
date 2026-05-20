/**
 * @jest-environment node
 */
const mockGetPublishedPosts = jest.fn()
const mockGenerateRSS = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPublishedPosts: mockGetPublishedPosts,
}))

jest.mock('@web/lib/rss/generateRSS', () => ({
  generateRSS: mockGenerateRSS,
}))

describe('GET /feed.xml', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetPublishedPosts.mockResolvedValue([])
    mockGenerateRSS.mockReturnValue('<rss>EN feed</rss>')
  })

  it('returns response with RSS content-type header', async () => {
    const { GET } = require('./route')
    const response = await GET()
    expect(response.headers.get('Content-Type')).toBe(
      'application/rss+xml; charset=utf-8',
    )
  })

  it('calls getPublishedPosts with en locale', async () => {
    const { GET } = require('./route')
    await GET()
    expect(mockGetPublishedPosts).toHaveBeenCalledWith('en')
  })

  it('passes first 20 posts to generateRSS', async () => {
    const posts = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      slug: `post-${i}`,
    }))
    mockGetPublishedPosts.mockResolvedValue(posts)
    const { GET } = require('./route')
    await GET()
    expect(mockGenerateRSS).toHaveBeenCalledWith(posts.slice(0, 20), 'en')
  })

  it('passes all posts when fewer than 20', async () => {
    const posts = [
      { id: '1', slug: 'post-1' },
      { id: '2', slug: 'post-2' },
    ]
    mockGetPublishedPosts.mockResolvedValue(posts)
    const { GET } = require('./route')
    await GET()
    expect(mockGenerateRSS).toHaveBeenCalledWith(posts, 'en')
  })

  it('returns the RSS content in the body', async () => {
    const { GET } = require('./route')
    const response = await GET()
    const text = await response.text()
    expect(text).toBe('<rss>EN feed</rss>')
  })
})

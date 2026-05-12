/**
 * @jest-environment node
 */
const mockGetRelatedPosts = jest.fn()

jest.mock('../../../../../lib/db/queries/posts', () => ({
  getRelatedPosts: mockGetRelatedPosts,
}))

const { GET } = require('./route') as {
  GET: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

const mockRelatedPost = {
  id: '01JWOTHER000000000000000000',
  category: 'engineering',
  tags: ['js'],
  status: 'published' as const,
  coverImage: null,
  seriesId: null,
  seriesOrder: null,
  publishedAt: new Date('2024-03-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-03-01'),
  author: 'admin',
  title: 'Related Post',
  slug: 'related-post',
  excerpt: 'A related excerpt',
  content: 'word '.repeat(400).trim(),
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/posts/[id]/related', () => {
  it('returns 400 when lng is missing', async () => {
    const response = await GET(
      new Request('http://localhost/api/posts/id/related'),
      makeParams('id'),
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when lng is invalid', async () => {
    const response = await GET(
      new Request('http://localhost/api/posts/id/related?lng=de'),
      makeParams('id'),
    )
    expect(response.status).toBe(400)
  })

  it('returns related posts with cache headers', async () => {
    mockGetRelatedPosts.mockResolvedValue([mockRelatedPost])
    const response = await GET(
      new Request('http://localhost/api/posts/id/related?lng=en'),
      makeParams('01JWTEST000000000000000000'),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe(
      's-maxage=60, stale-while-revalidate=3600',
    )
    const body = (await response.json()) as {
      data: Array<Record<string, unknown>>
    }
    expect(body.data).toHaveLength(1)
    expect(body.data[0]).not.toHaveProperty('status')
    expect(body.data[0]).not.toHaveProperty('createdAt')
    expect(body.data[0]).not.toHaveProperty('content')
    expect(body.data[0]).toHaveProperty('readingTime', 2)
    expect(body.data[0].publishedAt).toBe('2024-03-01T00:00:00.000Z')
  })

  it('returns empty array when no related posts', async () => {
    mockGetRelatedPosts.mockResolvedValue([])
    const response = await GET(
      new Request('http://localhost/api/posts/id/related?lng=es'),
      makeParams('id'),
    )
    const body = (await response.json()) as { data: unknown[] }
    expect(body.data).toHaveLength(0)
    expect(mockGetRelatedPosts).toHaveBeenCalledWith('id', 'es')
  })

  it('returns null publishedAt when not set', async () => {
    mockGetRelatedPosts.mockResolvedValue([
      { ...mockRelatedPost, publishedAt: null },
    ])
    const response = await GET(
      new Request('http://localhost/api/posts/id/related?lng=en'),
      makeParams('id'),
    )
    const body = (await response.json()) as {
      data: Array<Record<string, unknown>>
    }
    expect(body.data[0].publishedAt).toBeNull()
  })
})

export {}

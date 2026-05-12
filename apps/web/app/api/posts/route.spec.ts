/**
 * @jest-environment node
 */
const mockAuth = jest.fn()
const mockGetCategoryBySlug = jest.fn()
const mockSlugExistsForLocale = jest.fn()
const mockCreatePost = jest.fn()
const mockGetPublishedPostsPaginated = jest.fn()
const mockGetAllPosts = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('@web/lib/db/queries/categories', () => ({
  getCategoryBySlug: mockGetCategoryBySlug,
}))
jest.mock('@web/lib/db/queries/posts', () => ({
  createPost: mockCreatePost,
  slugExistsForLocale: mockSlugExistsForLocale,
  getPublishedPostsPaginated: mockGetPublishedPostsPaginated,
  getAllPosts: mockGetAllPosts,
}))

const { GET, POST } = require('./route') as {
  GET: (req: Request) => Promise<Response>
  POST: (req: Request) => Promise<Response>
}

const mockCategory = {
  id: 1,
  slug: 'engineering',
  name: 'Engineering',
  description: null,
}
const mockPost = {
  id: '01JWTEST000000000000000000',
  category: 'engineering',
  tags: [],
  author: 'admin',
  status: 'draft',
  coverImage: null,
  seriesId: null,
  seriesOrder: null,
  scheduledAt: null,
  publishedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
  previewToken: 'uuid-token',
}

const validTranslations = {
  en: { title: 'Test', slug: 'test', excerpt: 'Excerpt', content: '# Hi' },
  es: {
    title: 'Prueba',
    slug: 'prueba',
    excerpt: 'Resumen',
    content: '# Hola',
  },
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const mockPostWithContent = {
  id: '01JWTEST000000000000000000',
  category: 'engineering',
  tags: ['js'],
  status: 'published' as const,
  coverImage: null,
  seriesId: null,
  seriesOrder: null,
  publishedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  author: 'admin',
  title: 'Test Post',
  slug: 'test-post',
  excerpt: 'An excerpt',
  content: 'word '.repeat(200).trim(),
}

const mockAdminPost = {
  id: '01JWTEST',
  category: 'engineering',
  tags: ['react'],
  status: 'draft' as const,
  coverImage: null,
  seriesId: null,
  seriesOrder: null,
  scheduledAt: null,
  publishedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  previewToken: 'tok',
  titleEn: 'Test Post',
  slugEn: 'test-post',
  titleEs: 'Post de prueba',
  slugEs: 'post-de-prueba',
}

describe('GET /api/posts (admin status=all)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when status=all and no session', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await GET(
      new Request('http://localhost/api/posts?status=all'),
    )
    expect(response.status).toBe(401)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 200 with all posts when status=all and authenticated', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetAllPosts.mockResolvedValue([mockAdminPost])
    const response = await GET(
      new Request('http://localhost/api/posts?status=all'),
    )
    expect(response.status).toBe(200)
    const body = (await response.json()) as { data: unknown[] }
    expect(body.data).toHaveLength(1)
    expect(mockGetAllPosts).toHaveBeenCalledTimes(1)
  })
})

describe('GET /api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when lng is missing', async () => {
    const response = await GET(new Request('http://localhost/api/posts'))
    expect(response.status).toBe(400)
  })

  it('returns 400 when lng is invalid', async () => {
    const response = await GET(new Request('http://localhost/api/posts?lng=fr'))
    expect(response.status).toBe(400)
  })

  it('returns paginated posts with cache headers', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({
      data: [mockPostWithContent],
      total: 1,
    })
    const response = await GET(new Request('http://localhost/api/posts?lng=en'))
    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      data: Array<Record<string, unknown>>
      pagination: Record<string, unknown>
    }
    expect(body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    })
    expect(body.data).toHaveLength(1)
    expect(body.data[0]).not.toHaveProperty('content')
    expect(body.data[0]).not.toHaveProperty('status')
    expect(body.data[0]).not.toHaveProperty('createdAt')
    expect(body.data[0]).toHaveProperty('readingTime')
    expect(response.headers.get('Cache-Control')).toBe(
      's-maxage=60, stale-while-revalidate=3600',
    )
  })

  it('serialises publishedAt as ISO string', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({
      data: [mockPostWithContent],
      total: 1,
    })
    const response = await GET(new Request('http://localhost/api/posts?lng=en'))
    const body = (await response.json()) as {
      data: Array<Record<string, unknown>>
    }
    expect(body.data[0].publishedAt).toBe('2024-01-01T00:00:00.000Z')
    expect(body.data[0].updatedAt).toBe('2024-01-02T00:00:00.000Z')
  })

  it('returns null publishedAt when not set', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({
      data: [{ ...mockPostWithContent, publishedAt: null }],
      total: 1,
    })
    const response = await GET(new Request('http://localhost/api/posts?lng=en'))
    const body = (await response.json()) as {
      data: Array<Record<string, unknown>>
    }
    expect(body.data[0].publishedAt).toBeNull()
  })

  it('passes filters to query helper', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 0 })
    await GET(
      new Request(
        'http://localhost/api/posts?lng=es&page=2&limit=5&category=engineering&tag=react&q=hello',
      ),
    )
    expect(mockGetPublishedPostsPaginated).toHaveBeenCalledWith({
      locale: 'es',
      page: 2,
      limit: 5,
      category: 'engineering',
      tag: 'react',
      q: 'hello',
    })
  })

  it('computes totalPages correctly', async () => {
    mockGetPublishedPostsPaginated.mockResolvedValue({ data: [], total: 25 })
    const response = await GET(
      new Request('http://localhost/api/posts?lng=en&limit=10'),
    )
    const body = (await response.json()) as {
      pagination: { totalPages: number }
    }
    expect(body.pagination.totalPages).toBe(3)
  })
})

describe('POST /api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await POST(makeRequest({}))
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid JSON', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const request = new Request('http://localhost/api/posts', {
      method: 'POST',
      body: 'not-json',
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: 'Invalid JSON' })
  })

  it('returns 400 for invalid body schema', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await POST(makeRequest({ category: '' }))
    expect(response.status).toBe(400)
  })

  it('returns 422 when category does not exist', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(null)
    const response = await POST(
      makeRequest({
        category: 'unknown',
        author: 'admin',
        translations: { en: validTranslations.en },
      }),
    )
    expect(response.status).toBe(422)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/unknown category/i)
  })

  it('returns 422 when publishing without ES translation', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    const response = await POST(
      makeRequest({
        category: 'engineering',
        author: 'admin',
        status: 'published',
        translations: { en: validTranslations.en },
      }),
    )
    expect(response.status).toBe(422)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/both translations/i)
  })

  it('returns 409 when EN slug already taken', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockSlugExistsForLocale.mockResolvedValue(true)
    const response = await POST(
      makeRequest({
        category: 'engineering',
        author: 'admin',
        translations: { en: validTranslations.en },
      }),
    )
    expect(response.status).toBe(409)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/already taken/)
  })

  it('returns 409 when ES slug already taken', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockSlugExistsForLocale
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
    const response = await POST(
      makeRequest({
        category: 'engineering',
        author: 'admin',
        translations: validTranslations,
      }),
    )
    expect(response.status).toBe(409)
  })

  it('creates post and returns 201', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockSlugExistsForLocale.mockResolvedValue(false)
    mockCreatePost.mockResolvedValue(mockPost)
    const response = await POST(
      makeRequest({
        category: 'engineering',
        author: 'admin',
        translations: validTranslations,
      }),
    )
    expect(response.status).toBe(201)
    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'engineering', author: 'admin' }),
      expect.objectContaining({
        en: validTranslations.en,
        es: validTranslations.es,
      }),
    )
  })

  it('passes scheduledAt as Date when provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockSlugExistsForLocale.mockResolvedValue(false)
    mockCreatePost.mockResolvedValue(mockPost)
    await POST(
      makeRequest({
        category: 'engineering',
        author: 'admin',
        scheduledAt: '2024-06-01T00:00:00.000Z',
        translations: { en: validTranslations.en },
      }),
    )
    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        scheduledAt: new Date('2024-06-01T00:00:00.000Z'),
      }),
      expect.any(Object),
    )
  })
})

export {}

/**
 * @jest-environment node
 */
const mockAuth = jest.fn()
const mockGetCategoryBySlug = jest.fn()
const mockGetPostById = jest.fn()
const mockSlugExistsForLocale = jest.fn()
const mockGetPostTranslations = jest.fn()
const mockUpdatePost = jest.fn()
const mockUpsertTranslation = jest.fn()
const mockGetPostStatus = jest.fn()
const mockSoftDeletePost = jest.fn()

jest.mock('../../../../lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('../../../../lib/db/queries/categories', () => ({
  getCategoryBySlug: mockGetCategoryBySlug,
}))
jest.mock('../../../../lib/db/queries/posts', () => ({
  getPostById: mockGetPostById,
  slugExistsForLocale: mockSlugExistsForLocale,
  getPostTranslations: mockGetPostTranslations,
  updatePost: mockUpdatePost,
  upsertTranslation: mockUpsertTranslation,
  getPostStatus: mockGetPostStatus,
  softDeletePost: mockSoftDeletePost,
}))

const { DELETE, GET, PUT } = require('./route') as {
  GET: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>
  PUT: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>
  DELETE: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>
}

const mockPost = {
  id: '01JWTEST000000000000000000',
  category: 'engineering',
  tags: [],
  status: 'draft',
  coverImage: null,
  seriesId: null,
  seriesOrder: null,
  scheduledAt: null,
  publishedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
  previewToken: null,
  author: 'admin',
}

const mockCategory = {
  id: 1,
  slug: 'engineering',
  name: 'Engineering',
  description: null,
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

function makePutRequest(body: unknown): Request {
  return new Request('http://localhost/api/posts/some-id', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const mockPublishedPost = {
  id: '01JWTEST000000000000000000',
  category: 'engineering',
  tags: ['js'],
  status: 'published' as const,
  coverImage: null,
  seriesId: null,
  seriesOrder: null,
  publishedAt: new Date('2024-06-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
  author: 'admin',
  title: 'Test Post',
  slug: 'test-post',
  excerpt: 'An excerpt',
  content: 'word '.repeat(200).trim(),
}

describe('GET /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when lng is missing', async () => {
    const response = await GET(
      new Request('http://localhost/api/posts/id'),
      makeParams('id'),
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when lng is invalid', async () => {
    const response = await GET(
      new Request('http://localhost/api/posts/id?lng=fr'),
      makeParams('id'),
    )
    expect(response.status).toBe(400)
  })

  it('returns 404 when post not found', async () => {
    mockGetPostById.mockResolvedValue(null)
    const response = await GET(
      new Request('http://localhost/api/posts/id?lng=en'),
      makeParams('id'),
    )
    expect(response.status).toBe(404)
  })

  it('returns 404 when post is not published', async () => {
    mockGetPostById.mockResolvedValue({
      ...mockPublishedPost,
      status: 'draft',
    })
    const response = await GET(
      new Request('http://localhost/api/posts/id?lng=en'),
      makeParams('id'),
    )
    expect(response.status).toBe(404)
  })

  it('returns post with cache headers', async () => {
    mockGetPostById.mockResolvedValue(mockPublishedPost)
    const response = await GET(
      new Request('http://localhost/api/posts/id?lng=en'),
      makeParams('01JWTEST000000000000000000'),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe(
      's-maxage=60, stale-while-revalidate=3600',
    )
    const body = (await response.json()) as Record<string, unknown>
    expect(body).not.toHaveProperty('status')
    expect(body).not.toHaveProperty('createdAt')
    expect(body).toHaveProperty('content')
    expect(body).toHaveProperty('readingTime')
    expect(body.publishedAt).toBe('2024-06-01T00:00:00.000Z')
    expect(body.updatedAt).toBe('2024-06-01T00:00:00.000Z')
  })

  it('returns null publishedAt when not set', async () => {
    mockGetPostById.mockResolvedValue({
      ...mockPublishedPost,
      publishedAt: null,
    })
    const response = await GET(
      new Request('http://localhost/api/posts/id?lng=en'),
      makeParams('id'),
    )
    const body = (await response.json()) as Record<string, unknown>
    expect(body.publishedAt).toBeNull()
  })
})

describe('PUT /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await PUT(makePutRequest({}), makeParams('id'))
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid JSON', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const request = new Request('http://localhost/api/posts/id', {
      method: 'PUT',
      body: 'not-json',
    })
    const response = await PUT(request, makeParams('id'))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: 'Invalid JSON' })
  })

  it('returns 400 for invalid schema', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await PUT(
      makePutRequest({ status: 'invalid-status' }),
      makeParams('id'),
    )
    expect(response.status).toBe(400)
  })

  it('returns 422 when category does not exist', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(null)
    const response = await PUT(
      makePutRequest({ category: 'unknown' }),
      makeParams('id'),
    )
    expect(response.status).toBe(422)
  })

  it('returns 409 when slug already taken for locale', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockSlugExistsForLocale.mockResolvedValue(true)
    const response = await PUT(
      makePutRequest({
        translations: {
          en: {
            title: 'Title',
            slug: 'taken-slug',
            excerpt: 'excerpt',
            content: 'content',
          },
        },
      }),
      makeParams('01JWTEST000000000000000000'),
    )
    expect(response.status).toBe(409)
  })

  it('returns 422 when publishing with missing translations', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockSlugExistsForLocale.mockResolvedValue(false)
    mockGetPostTranslations.mockResolvedValue([
      {
        postId: 'id',
        locale: 'en',
        title: 'T',
        slug: 's',
        excerpt: 'e',
        content: 'c',
      },
    ])
    const response = await PUT(
      makePutRequest({ status: 'published' }),
      makeParams('id'),
    )
    expect(response.status).toBe(422)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/both translations/i)
  })

  it('returns 404 when post not found', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetPostTranslations.mockResolvedValue([
      { locale: 'en' },
      { locale: 'es' },
    ])
    mockUpdatePost.mockResolvedValue(null)
    const response = await PUT(
      makePutRequest({ status: 'published' }),
      makeParams('nonexistent'),
    )
    expect(response.status).toBe(404)
  })

  it('sets publishedAt when status changes to published', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetPostTranslations.mockResolvedValue([
      { locale: 'en' },
      { locale: 'es' },
    ])
    mockUpdatePost.mockResolvedValue({ ...mockPost, status: 'published' })
    await PUT(makePutRequest({ status: 'published' }), makeParams('id'))
    expect(mockUpdatePost).toHaveBeenCalledWith(
      'id',
      expect.objectContaining({ publishedAt: expect.any(Date) }),
    )
  })

  it('clears publishedAt when status changes to draft', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUpdatePost.mockResolvedValue({ ...mockPost, status: 'draft' })
    await PUT(makePutRequest({ status: 'draft' }), makeParams('id'))
    expect(mockUpdatePost).toHaveBeenCalledWith(
      'id',
      expect.objectContaining({ publishedAt: null }),
    )
  })

  it('does not touch publishedAt when status not provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUpdatePost.mockResolvedValue(mockPost)
    await PUT(makePutRequest({ tags: ['react'] }), makeParams('id'))
    const callArg = mockUpdatePost.mock.calls[0][1] as Record<string, unknown>
    expect(callArg).not.toHaveProperty('publishedAt')
  })

  it('updates post metadata and returns 200', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUpdatePost.mockResolvedValue({ ...mockPost, tags: ['react'] })
    const response = await PUT(
      makePutRequest({ tags: ['react'] }),
      makeParams('01JWTEST000000000000000000'),
    )
    expect(response.status).toBe(200)
    expect(mockUpdatePost).toHaveBeenCalled()
  })

  it('upserts translations when provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockSlugExistsForLocale.mockResolvedValue(false)
    mockUpdatePost.mockResolvedValue(mockPost)
    mockUpsertTranslation.mockResolvedValue({})
    const enTranslation = {
      title: 'New Title',
      slug: 'new-title',
      excerpt: 'excerpt',
      content: 'content',
    }
    const response = await PUT(
      makePutRequest({ translations: { en: enTranslation } }),
      makeParams('01JWTEST000000000000000000'),
    )
    expect(response.status).toBe(200)
    expect(mockUpsertTranslation).toHaveBeenCalledWith(
      '01JWTEST000000000000000000',
      'en',
      enTranslation,
    )
  })

  it('validates category when provided and updates post', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpdatePost.mockResolvedValue({ ...mockPost, category: 'engineering' })
    const response = await PUT(
      makePutRequest({ category: 'engineering' }),
      makeParams('01JWTEST000000000000000000'),
    )
    expect(response.status).toBe(200)
    expect(mockGetCategoryBySlug).toHaveBeenCalledWith('engineering')
  })

  it('passes scheduledAt as Date when provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUpdatePost.mockResolvedValue(mockPost)
    await PUT(
      makePutRequest({ scheduledAt: '2024-06-01T00:00:00.000Z' }),
      makeParams('id'),
    )
    expect(mockUpdatePost).toHaveBeenCalledWith(
      'id',
      expect.objectContaining({
        scheduledAt: new Date('2024-06-01T00:00:00.000Z'),
      }),
    )
  })

  it('passes null scheduledAt when empty string', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUpdatePost.mockResolvedValue(mockPost)
    await PUT(makePutRequest({ scheduledAt: '' }), makeParams('id'))
    expect(mockUpdatePost).toHaveBeenCalledWith(
      'id',
      expect.objectContaining({ scheduledAt: null }),
    )
  })

  it('succeeds publishing when both translations exist in DB', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetPostTranslations.mockResolvedValue([
      { locale: 'en' },
      { locale: 'es' },
    ])
    mockUpdatePost.mockResolvedValue({ ...mockPost, status: 'published' })
    const response = await PUT(
      makePutRequest({ status: 'published' }),
      makeParams('id'),
    )
    expect(response.status).toBe(200)
  })

  it('succeeds publishing when missing locale is covered by update', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockSlugExistsForLocale.mockResolvedValue(false)
    mockGetPostTranslations.mockResolvedValue([{ locale: 'en' }])
    mockUpdatePost.mockResolvedValue({ ...mockPost, status: 'published' })
    mockUpsertTranslation.mockResolvedValue({})
    const response = await PUT(
      makePutRequest({
        status: 'published',
        translations: {
          es: { title: 'T', slug: 's', excerpt: 'e', content: 'c' },
        },
      }),
      makeParams('id'),
    )
    expect(response.status).toBe(200)
  })
})

describe('DELETE /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await DELETE(
      new Request('http://localhost/api/posts/id', { method: 'DELETE' }),
      makeParams('id'),
    )
    expect(response.status).toBe(401)
  })

  it('returns 422 when post is published', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetPostStatus.mockResolvedValue('published')
    const response = await DELETE(
      new Request('http://localhost/api/posts/id', { method: 'DELETE' }),
      makeParams('id'),
    )
    expect(response.status).toBe(422)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/unpublish|archive/i)
    expect(mockSoftDeletePost).not.toHaveBeenCalled()
  })

  it('soft-deletes post and returns 204', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetPostStatus.mockResolvedValue('draft')
    mockSoftDeletePost.mockResolvedValue(undefined)
    const response = await DELETE(
      new Request('http://localhost/api/posts/id', { method: 'DELETE' }),
      makeParams('01JWTEST000000000000000000'),
    )
    expect(response.status).toBe(204)
    expect(mockSoftDeletePost).toHaveBeenCalledWith(
      '01JWTEST000000000000000000',
    )
  })
})

export {}

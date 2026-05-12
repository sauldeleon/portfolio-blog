/**
 * @jest-environment node
 */
const mockAuth = jest.fn()
const mockGetCategoryBySlug = jest.fn()
const mockSlugExistsForLocale = jest.fn()
const mockGetPostTranslations = jest.fn()
const mockUpdatePost = jest.fn()
const mockUpdateTranslation = jest.fn()
const mockSoftDeletePost = jest.fn()

jest.mock('../../../../lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('../../../../lib/db/queries/categories', () => ({
  getCategoryBySlug: mockGetCategoryBySlug,
}))
jest.mock('../../../../lib/db/queries/posts', () => ({
  slugExistsForLocale: mockSlugExistsForLocale,
  getPostTranslations: mockGetPostTranslations,
  updatePost: mockUpdatePost,
  updateTranslation: mockUpdateTranslation,
  softDeletePost: mockSoftDeletePost,
}))

const { DELETE, PUT } = require('./route') as {
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
      makePutRequest({ translations: { en: { slug: 'taken-slug' } } }),
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

  it('updates translations when provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockSlugExistsForLocale.mockResolvedValue(false)
    mockUpdatePost.mockResolvedValue(mockPost)
    mockUpdateTranslation.mockResolvedValue({})
    const response = await PUT(
      makePutRequest({ translations: { en: { title: 'New Title' } } }),
      makeParams('01JWTEST000000000000000000'),
    )
    expect(response.status).toBe(200)
    expect(mockUpdateTranslation).toHaveBeenCalledWith(
      '01JWTEST000000000000000000',
      'en',
      { title: 'New Title' },
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
    mockUpdateTranslation.mockResolvedValue({})
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

  it('soft-deletes post and returns 204', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
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

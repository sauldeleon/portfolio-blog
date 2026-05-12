/**
 * @jest-environment node
 */
const mockAuth = jest.fn()
const mockGetCategoryBySlug = jest.fn()
const mockSlugExistsForLocale = jest.fn()
const mockCreatePost = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('@web/lib/db/queries/categories', () => ({
  getCategoryBySlug: mockGetCategoryBySlug,
}))
jest.mock('@web/lib/db/queries/posts', () => ({
  createPost: mockCreatePost,
  slugExistsForLocale: mockSlugExistsForLocale,
}))

const { POST } = require('./route') as {
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

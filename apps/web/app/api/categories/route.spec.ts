/**
 * @jest-environment node
 */
const mockAuth = jest.fn()
const mockGetCategories = jest.fn()
const mockGetCategoriesForAdmin = jest.fn()
const mockGetCategoryBySlug = jest.fn()
const mockCreateCategory = jest.fn()
const mockCreateCategoryTranslation = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('@web/lib/db/queries/categories', () => ({
  getCategories: mockGetCategories,
  getCategoriesForAdmin: mockGetCategoriesForAdmin,
  getCategoryBySlug: mockGetCategoryBySlug,
  createCategory: mockCreateCategory,
  createCategoryTranslation: mockCreateCategoryTranslation,
}))

const { GET, POST } = require('./route') as {
  GET: (req: Request) => Promise<Response>
  POST: (req: Request) => Promise<Response>
}

const mockCategory = { id: 1, slug: 'engineering' }
const mockTranslationEN = {
  categorySlug: 'engineering',
  locale: 'en',
  name: 'Engineering',
  description: null,
  slug: 'engineering',
}
const mockTranslationES = {
  categorySlug: 'engineering',
  locale: 'es',
  name: 'Ingeniería',
  description: null,
  slug: 'ingenieria',
}

function makeGetRequest(url = 'http://localhost/api/categories'): Request {
  return new Request(url)
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeValidBody(overrides?: object) {
  return {
    translations: {
      en: { name: 'Engineering', slug: 'engineering' },
    },
    ...overrides,
  }
}

describe('GET /api/categories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns categories with cache headers', async () => {
    mockGetCategories.mockResolvedValue([mockCategory])
    const response = await GET(makeGetRequest())
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ data: [mockCategory] })
    expect(response.headers.get('Cache-Control')).toBe(
      's-maxage=60, stale-while-revalidate=3600',
    )
  })

  it('returns empty array when no categories', async () => {
    mockGetCategories.mockResolvedValue([])
    const response = await GET(makeGetRequest())
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ data: [] })
  })

  it('returns 401 for admin request when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await GET(
      makeGetRequest('http://localhost/api/categories?admin=1'),
    )
    expect(response.status).toBe(401)
  })

  it('returns admin categories for authenticated admin request', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoriesForAdmin.mockResolvedValue([mockCategory])
    const response = await GET(
      makeGetRequest('http://localhost/api/categories?admin=1'),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ data: [mockCategory] })
    expect(response.headers.get('Cache-Control')).toBeNull()
  })
})

describe('POST /api/categories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await POST(makeRequest(makeValidBody()))
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid JSON', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const request = new Request('http://localhost/api/categories', {
      method: 'POST',
      body: 'not-json',
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: 'Invalid JSON' })
  })

  it('returns 400 when translations is missing', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await POST(makeRequest({}))
    expect(response.status).toBe(400)
  })

  it('returns 400 when en translation is missing', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await POST(
      makeRequest({
        translations: { es: { name: 'Ingeniería', slug: 'ingenieria' } },
      }),
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when en slug has invalid format', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await POST(
      makeRequest({
        translations: { en: { name: 'Test', slug: 'INVALID SLUG!' } },
      }),
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when en name is missing', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await POST(
      makeRequest({ translations: { en: { slug: 'valid-slug' } } }),
    )
    expect(response.status).toBe(400)
  })

  it('returns 409 when slug already exists', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    const response = await POST(makeRequest(makeValidBody()))
    expect(response.status).toBe(409)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/already exists/)
  })

  it('creates category with EN translation and returns 201', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(null)
    mockCreateCategory.mockResolvedValue(mockCategory)
    mockCreateCategoryTranslation.mockResolvedValue(mockTranslationEN)
    const response = await POST(makeRequest(makeValidBody()))
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toMatchObject({ slug: 'engineering' })
    expect(mockCreateCategory).toHaveBeenCalledWith('engineering')
    expect(mockCreateCategoryTranslation).toHaveBeenCalledTimes(1)
    expect(mockCreateCategoryTranslation).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'en',
        name: 'Engineering',
        slug: 'engineering',
      }),
    )
  })

  it('creates category with EN and ES translations and returns 201', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(null)
    mockCreateCategory.mockResolvedValue(mockCategory)
    mockCreateCategoryTranslation
      .mockResolvedValueOnce(mockTranslationEN)
      .mockResolvedValueOnce(mockTranslationES)
    const response = await POST(
      makeRequest({
        translations: {
          en: { name: 'Engineering', slug: 'engineering' },
          es: { name: 'Ingeniería', slug: 'ingenieria' },
        },
      }),
    )
    expect(response.status).toBe(201)
    expect(mockCreateCategoryTranslation).toHaveBeenCalledTimes(2)
    expect(mockCreateCategoryTranslation).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'es',
        name: 'Ingeniería',
        slug: 'ingenieria',
      }),
    )
  })

  it('creates category with description', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(null)
    mockCreateCategory.mockResolvedValue(mockCategory)
    mockCreateCategoryTranslation.mockResolvedValue({
      ...mockTranslationEN,
      description: 'Desc',
    })
    const response = await POST(
      makeRequest({
        translations: {
          en: { name: 'Engineering', slug: 'engineering', description: 'Desc' },
        },
      }),
    )
    expect(response.status).toBe(201)
    expect(mockCreateCategoryTranslation).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Desc' }),
    )
  })
})

export {}

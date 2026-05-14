/**
 * @jest-environment node
 */
const mockAuth = jest.fn()
const mockGetCategoryBySlug = jest.fn()
const mockUpsertCategoryTranslation = jest.fn()
const mockGetPublishedPostCountByCategory = jest.fn()
const mockDeleteCategory = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('@web/lib/db/queries/categories', () => ({
  getCategoryBySlug: mockGetCategoryBySlug,
  upsertCategoryTranslation: mockUpsertCategoryTranslation,
  deleteCategory: mockDeleteCategory,
}))
jest.mock('@web/lib/db/queries/posts', () => ({
  getPublishedPostCountByCategory: mockGetPublishedPostCountByCategory,
}))

const { DELETE, PUT } = require('./route') as typeof import('./route')

const mockCategory = { id: 1, slug: 'engineering' }
const mockTranslation = {
  categorySlug: 'engineering',
  locale: 'en',
  name: 'Engineering',
  description: null,
  slug: 'engineering',
}

function makeParams(slug: string) {
  return { params: Promise.resolve({ slug }) }
}

function makePutRequest(body: unknown): Request {
  return new Request('http://localhost/api/categories/engineering', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PUT /api/categories/[slug]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await PUT(
      makePutRequest({ locale: 'en' }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid JSON', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const request = new Request('http://localhost/api/categories/engineering', {
      method: 'PUT',
      body: 'not-json',
    })
    const response = await PUT(request, makeParams('engineering'))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: 'Invalid JSON' })
  })

  it('returns 400 when locale is missing', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await PUT(
      makePutRequest({ name: 'Updated' }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when locale is invalid', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await PUT(
      makePutRequest({ locale: 'fr', name: 'Updated' }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when locale slug has invalid format', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await PUT(
      makePutRequest({ locale: 'en', slug: 'INVALID SLUG!' }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(400)
  })

  it('returns 404 when category not found', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(null)
    const response = await PUT(
      makePutRequest({ locale: 'en', name: 'Updated' }),
      makeParams('nonexistent'),
    )
    expect(response.status).toBe(404)
  })

  it('upserts translation and returns 200', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpsertCategoryTranslation.mockResolvedValue({
      ...mockTranslation,
      name: 'Updated',
    })
    const response = await PUT(
      makePutRequest({ locale: 'en', name: 'Updated' }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({ name: 'Updated' })
    expect(mockUpsertCategoryTranslation).toHaveBeenCalledWith(
      expect.objectContaining({
        categorySlug: 'engineering',
        locale: 'en',
        name: 'Updated',
      }),
    )
  })

  it('upserts ES translation', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpsertCategoryTranslation.mockResolvedValue({
      categorySlug: 'engineering',
      locale: 'es',
      name: 'Ingeniería',
      description: null,
      slug: 'ingenieria',
    })
    const response = await PUT(
      makePutRequest({ locale: 'es', name: 'Ingeniería', slug: 'ingenieria' }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(200)
    expect(mockUpsertCategoryTranslation).toHaveBeenCalledWith(
      expect.objectContaining({ locale: 'es', slug: 'ingenieria' }),
    )
  })

  it('falls back to canonical slug when locale slug not provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpsertCategoryTranslation.mockResolvedValue(mockTranslation)
    await PUT(
      makePutRequest({ locale: 'en', name: 'Engineering' }),
      makeParams('engineering'),
    )
    expect(mockUpsertCategoryTranslation).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'engineering' }),
    )
  })

  it('falls back to canonical slug as name when name not provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpsertCategoryTranslation.mockResolvedValue(mockTranslation)
    await PUT(makePutRequest({ locale: 'en' }), makeParams('engineering'))
    expect(mockUpsertCategoryTranslation).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'engineering' }),
    )
  })

  it('sets description to null when not provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpsertCategoryTranslation.mockResolvedValue(mockTranslation)
    await PUT(
      makePutRequest({ locale: 'en', name: 'Engineering' }),
      makeParams('engineering'),
    )
    expect(mockUpsertCategoryTranslation).toHaveBeenCalledWith(
      expect.objectContaining({ description: null }),
    )
  })

  it('passes explicit null description', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpsertCategoryTranslation.mockResolvedValue(mockTranslation)
    await PUT(
      makePutRequest({ locale: 'en', name: 'Engineering', description: null }),
      makeParams('engineering'),
    )
    expect(mockUpsertCategoryTranslation).toHaveBeenCalledWith(
      expect.objectContaining({ description: null }),
    )
  })

  it('passes description when provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpsertCategoryTranslation.mockResolvedValue({
      ...mockTranslation,
      description: 'Desc',
    })
    await PUT(
      makePutRequest({
        locale: 'en',
        name: 'Engineering',
        description: 'Desc',
      }),
      makeParams('engineering'),
    )
    expect(mockUpsertCategoryTranslation).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Desc' }),
    )
  })
})

describe('DELETE /api/categories/[slug]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await DELETE(
      new Request('http://localhost/api/categories/engineering', {
        method: 'DELETE',
      }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(401)
  })

  it('returns 409 when published posts reference category', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetPublishedPostCountByCategory.mockResolvedValue(3)
    const response = await DELETE(
      new Request('http://localhost/api/categories/engineering', {
        method: 'DELETE',
      }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(409)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/3 published/)
  })

  it('deletes category and returns 204 when no published posts', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetPublishedPostCountByCategory.mockResolvedValue(0)
    mockDeleteCategory.mockResolvedValue(undefined)
    const response = await DELETE(
      new Request('http://localhost/api/categories/engineering', {
        method: 'DELETE',
      }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(204)
    expect(mockDeleteCategory).toHaveBeenCalledWith('engineering')
  })
})

export {}

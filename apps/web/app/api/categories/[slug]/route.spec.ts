/**
 * @jest-environment node
 */
const mockAuth = jest.fn()
const mockGetCategoryBySlug = jest.fn()
const mockUpdateCategoryBySlug = jest.fn()
const mockGetPublishedPostCountByCategory = jest.fn()
const mockDeleteCategory = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('@web/lib/db/queries/categories', () => ({
  getCategoryBySlug: mockGetCategoryBySlug,
  updateCategoryBySlug: mockUpdateCategoryBySlug,
  deleteCategory: mockDeleteCategory,
}))
jest.mock('@web/lib/db/queries/posts', () => ({
  getPublishedPostCountByCategory: mockGetPublishedPostCountByCategory,
}))

const { DELETE, PUT } = require('./route') as typeof import('./route')

const mockCategory = {
  id: 1,
  slug: 'engineering',
  name: 'Engineering',
  description: null,
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
    const response = await PUT(makePutRequest({}), makeParams('engineering'))
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

  it('returns 400 when slug is included in body', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await PUT(
      makePutRequest({ slug: 'new-slug', name: 'Updated' }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(400)
  })

  it('returns 404 when category not found', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(null)
    const response = await PUT(
      makePutRequest({ name: 'Updated' }),
      makeParams('nonexistent'),
    )
    expect(response.status).toBe(404)
  })

  it('updates category name and returns 200', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpdateCategoryBySlug.mockResolvedValue({
      ...mockCategory,
      name: 'Updated',
    })
    const response = await PUT(
      makePutRequest({ name: 'Updated' }),
      makeParams('engineering'),
    )
    expect(response.status).toBe(200)
    expect(mockUpdateCategoryBySlug).toHaveBeenCalledWith(
      'engineering',
      expect.objectContaining({ name: 'Updated' }),
    )
  })

  it('keeps existing name when not provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpdateCategoryBySlug.mockResolvedValue(mockCategory)
    await PUT(
      makePutRequest({ description: 'New desc' }),
      makeParams('engineering'),
    )
    expect(mockUpdateCategoryBySlug).toHaveBeenCalledWith(
      'engineering',
      expect.objectContaining({ name: 'Engineering' }),
    )
  })

  it('updates description when provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    mockUpdateCategoryBySlug.mockResolvedValue({
      ...mockCategory,
      description: 'Desc',
    })
    await PUT(
      makePutRequest({ description: 'Desc' }),
      makeParams('engineering'),
    )
    expect(mockUpdateCategoryBySlug).toHaveBeenCalledWith(
      'engineering',
      expect.objectContaining({ description: 'Desc' }),
    )
  })

  it('falls back to existing description when not provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue({
      ...mockCategory,
      description: 'Old',
    })
    mockUpdateCategoryBySlug.mockResolvedValue({
      ...mockCategory,
      description: 'Old',
    })
    await PUT(makePutRequest({ name: 'Name' }), makeParams('engineering'))
    expect(mockUpdateCategoryBySlug).toHaveBeenCalledWith(
      'engineering',
      expect.objectContaining({ description: 'Old' }),
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

/**
 * @jest-environment node
 */
const mockAuth = jest.fn()
const mockGetCategoryBySlug = jest.fn()
const mockCreateCategory = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('@web/lib/db/queries/categories', () => ({
  getCategoryBySlug: mockGetCategoryBySlug,
  createCategory: mockCreateCategory,
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

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/categories', () => {
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
    const request = new Request('http://localhost/api/categories', {
      method: 'POST',
      body: 'not-json',
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: 'Invalid JSON' })
  })

  it('returns 400 when slug has invalid format', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await POST(
      makeRequest({ slug: 'INVALID SLUG!', name: 'Test' }),
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when name is missing', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await POST(makeRequest({ slug: 'valid-slug' }))
    expect(response.status).toBe(400)
  })

  it('returns 409 when slug already exists', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(mockCategory)
    const response = await POST(
      makeRequest({ slug: 'engineering', name: 'Engineering' }),
    )
    expect(response.status).toBe(409)
    const body = (await response.json()) as { error: string }
    expect(body.error).toMatch(/already exists/)
  })

  it('creates category and returns 201', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(null)
    mockCreateCategory.mockResolvedValue(mockCategory)
    const response = await POST(
      makeRequest({ slug: 'engineering', name: 'Engineering' }),
    )
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toMatchObject({ slug: 'engineering', name: 'Engineering' })
  })

  it('creates category with optional description', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoryBySlug.mockResolvedValue(null)
    mockCreateCategory.mockResolvedValue({
      ...mockCategory,
      description: 'Desc',
    })
    const response = await POST(
      makeRequest({
        slug: 'engineering',
        name: 'Engineering',
        description: 'Desc',
      }),
    )
    expect(response.status).toBe(201)
    expect(mockCreateCategory).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Desc' }),
    )
  })
})

export {}

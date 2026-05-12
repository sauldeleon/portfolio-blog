/**
 * @jest-environment node
 */
const mockGetPostCountPerTag = jest.fn()

jest.mock('@web/lib/db/queries/tags', () => ({
  getPostCountPerTag: mockGetPostCountPerTag,
}))

const { GET } = require('./route') as { GET: () => Promise<Response> }

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/tags', () => {
  it('returns tags with counts and cache headers', async () => {
    mockGetPostCountPerTag.mockResolvedValue([
      { tag: 'react', count: 5 },
      { tag: 'typescript', count: 3 },
    ])
    const response = await GET()
    expect(response.status).toBe(200)
    const body = (await response.json()) as { data: unknown }
    expect(body.data).toEqual([
      { tag: 'react', count: 5 },
      { tag: 'typescript', count: 3 },
    ])
    expect(response.headers.get('Cache-Control')).toBe(
      's-maxage=60, stale-while-revalidate=3600',
    )
  })

  it('returns empty array when no tags', async () => {
    mockGetPostCountPerTag.mockResolvedValue([])
    const response = await GET()
    expect(response.status).toBe(200)
    const body = (await response.json()) as { data: unknown[] }
    expect(body.data).toHaveLength(0)
  })
})

export {}

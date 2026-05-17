/**
 * @jest-environment node
 */
import { GET } from './route'

const mockAuth = jest.fn()
const mockGetPostsForSeries = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
jest.mock('@web/lib/db/queries/series', () => ({
  getPostsForSeries: (...args: unknown[]) => mockGetPostsForSeries(...args),
}))

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'admin' } })
})

describe('GET /api/series/[id]/posts', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET(
      new Request('http://localhost/api/series/my-series/posts'),
      makeParams('my-series'),
    )
    expect(res.status).toBe(401)
  })

  it('returns posts for the series', async () => {
    const mockPosts = [
      { id: 'post-1', seriesOrder: 1, enSlug: 'my-post', enTitle: 'My Post' },
      {
        id: 'post-2',
        seriesOrder: 2,
        enSlug: 'second-post',
        enTitle: 'Second Post',
      },
    ]
    mockGetPostsForSeries.mockResolvedValue(mockPosts)

    const res = await GET(
      new Request('http://localhost/api/series/my-series/posts'),
      makeParams('my-series'),
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { data: typeof mockPosts }
    expect(body.data).toEqual(mockPosts)
    expect(mockGetPostsForSeries).toHaveBeenCalledWith('my-series')
  })

  it('returns empty array when series has no posts', async () => {
    mockGetPostsForSeries.mockResolvedValue([])

    const res = await GET(
      new Request('http://localhost/api/series/empty-series/posts'),
      makeParams('empty-series'),
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { data: unknown[] }
    expect(body.data).toEqual([])
  })
})

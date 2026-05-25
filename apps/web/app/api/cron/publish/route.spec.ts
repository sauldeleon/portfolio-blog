/**
 * @jest-environment node
 */
const mockGetScheduledPostsToPublish = jest.fn()
const mockUpdatePost = jest.fn()
const mockRevalidateTag = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getScheduledPostsToPublish: mockGetScheduledPostsToPublish,
  updatePost: mockUpdatePost,
}))

jest.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
}))

jest.mock('@web/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}))

const { GET } = require('./route') as {
  GET: (req: Request) => Promise<Response>
}

function makeRequest(authHeader?: string) {
  const headers: Record<string, string> = {}
  if (authHeader) headers['Authorization'] = authHeader
  return new Request('http://localhost/api/cron/publish', { headers })
}

describe('GET /api/cron/publish', () => {
  const originalCronSecret = process.env.CRON_SECRET

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'test-secret-xyz'
    mockGetScheduledPostsToPublish.mockResolvedValue([])
    mockUpdatePost.mockResolvedValue(null)
  })

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret
  })

  it('returns 401 when Authorization header is missing', async () => {
    const response = await GET(makeRequest())
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('returns 401 when Authorization header has wrong token', async () => {
    const response = await GET(makeRequest('Bearer wrong-secret'))
    expect(response.status).toBe(401)
  })

  it('returns 401 when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET
    const response = await GET(makeRequest('Bearer test-secret-xyz'))
    expect(response.status).toBe(401)
  })

  it('returns 200 with published count when authorized', async () => {
    const response = await GET(makeRequest('Bearer test-secret-xyz'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ published: 0 })
  })

  it('publishes scheduled posts and returns count', async () => {
    const scheduledPosts = [
      { id: 'post-1', scheduledAt: new Date('2024-01-10T08:00:00Z') },
      { id: 'post-2', scheduledAt: new Date('2024-01-11T08:00:00Z') },
    ]
    mockGetScheduledPostsToPublish.mockResolvedValue(scheduledPosts)

    const response = await GET(makeRequest('Bearer test-secret-xyz'))
    expect(response.status).toBe(200)

    expect(mockUpdatePost).toHaveBeenCalledTimes(2)
    expect(mockUpdatePost).toHaveBeenCalledWith('post-1', {
      status: 'published',
      publishedAt: scheduledPosts[0].scheduledAt,
    })
    expect(mockUpdatePost).toHaveBeenCalledWith('post-2', {
      status: 'published',
      publishedAt: scheduledPosts[1].scheduledAt,
    })

    const body = await response.json()
    expect(body).toEqual({ published: 2 })
  })

  it('calls revalidateTag when posts are published', async () => {
    mockGetScheduledPostsToPublish.mockResolvedValue([
      { id: 'post-1', scheduledAt: new Date('2024-01-10T08:00:00Z') },
    ])
    await GET(makeRequest('Bearer test-secret-xyz'))
    expect(mockRevalidateTag).toHaveBeenCalledWith('posts', 'default')
    expect(mockRevalidateTag).toHaveBeenCalledWith('post-post-1', 'default')
  })

  it('does not call revalidateTag when no posts are published', async () => {
    mockGetScheduledPostsToPublish.mockResolvedValue([])
    await GET(makeRequest('Bearer test-secret-xyz'))
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('returns 500 and logs error when getScheduledPostsToPublish throws', async () => {
    const err = new Error('DB error')
    mockGetScheduledPostsToPublish.mockRejectedValue(err)
    const response = await GET(makeRequest('Bearer test-secret-xyz'))
    expect(response.status).toBe(500)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('Failed to publish scheduled posts')
    expect(mockLoggerError).toHaveBeenCalledWith(
      err,
      'Failed to publish scheduled posts',
    )
  })
})

/**
 * @vitest-environment node
 */
const mockGetCommentsAdmin = vi.fn()
const mockRequireAuth = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('@web/lib/db/queries/comments', () => ({
  getCommentsAdmin: (...args: unknown[]) => mockGetCommentsAdmin(...args),
}))
vi.mock('@web/lib/api/parseRequest', () => ({
  requireAuth: () => mockRequireAuth(),
}))
vi.mock('@web/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}))

const { GET } = (await import('./route')) as unknown as {
  GET: (req: Request) => Promise<Response>
}

const mockSession = { user: { role: 'editor' } }

const mockComment = {
  id: 'c1',
  postId: 'p1',
  parentId: null,
  username: 'tester',
  body: 'hi',
  status: 'pending',
  createdAt: new Date('2024-01-01'),
}

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/comments')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new Request(url.toString())
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireAuth.mockResolvedValue({ ok: true, session: mockSession })
  mockGetCommentsAdmin.mockResolvedValue([mockComment])
})

describe('GET /api/comments', () => {
  it('returns comments list', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.comments).toHaveLength(1)
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      }),
    })
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
    expect(mockGetCommentsAdmin).not.toHaveBeenCalled()
  })

  it('filters by postId', async () => {
    await GET(makeRequest({ postId: 'p1' }))
    expect(mockGetCommentsAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ postId: 'p1' }),
    )
  })

  it('filters by status', async () => {
    await GET(makeRequest({ status: 'pending' }))
    expect(mockGetCommentsAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending' }),
    )
  })

  it('returns 400 for invalid status', async () => {
    const res = await GET(makeRequest({ status: 'invalid' }))
    expect(res.status).toBe(400)
  })

  it('returns 500 when query throws', async () => {
    mockGetCommentsAdmin.mockRejectedValue(new Error('db error'))
    const res = await GET(makeRequest())
    expect(res.status).toBe(500)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

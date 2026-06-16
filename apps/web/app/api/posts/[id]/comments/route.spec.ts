/**
 * @jest-environment node
 */
const mockGetApprovedCommentsByPost = jest.fn()
const mockCreateComment = jest.fn()
const mockGetPostMeta = jest.fn()
const mockNotifyNewComment = jest.fn()
const mockVerifyTurnstile = jest.fn()
const mockRatelimitHolder: { value: { limit: jest.Mock } | null } = {
  value: { limit: jest.fn() },
}
const mockLoggerError = jest.fn()

jest.mock('@web/lib/db/queries/comments', () => ({
  getApprovedCommentsByPost: (...args: unknown[]) =>
    mockGetApprovedCommentsByPost(...args),
  createComment: (...args: unknown[]) => mockCreateComment(...args),
}))
jest.mock('@web/lib/db/queries/posts', () => ({
  getPostMeta: (...args: unknown[]) => mockGetPostMeta(...args),
}))
jest.mock('@web/lib/email/notifyNewComment', () => ({
  notifyNewComment: (...args: unknown[]) => mockNotifyNewComment(...args),
}))
jest.mock('@web/lib/turnstile/verify', () => ({
  verifyTurnstile: (...args: unknown[]) => mockVerifyTurnstile(...args),
}))
jest.mock('@web/lib/ratelimit', () => ({
  get ratelimit() {
    return mockRatelimitHolder.value
  },
}))
jest.mock('@web/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}))

const { GET, POST } = require('./route') as {
  GET: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>
  POST: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>
}

const POST_ID = 'post-ulid-123'

function makeCtx(id = POST_ID) {
  return { params: Promise.resolve({ id }) }
}

const validBody = {
  username: 'tester',
  body: 'Great post!',
  turnstileToken: 'valid-token',
  postTitle: 'My Post',
  postNumber: 1,
  postSlug: 'my-post',
  postLng: 'en',
}

function makePostRequest(
  body: unknown = validBody,
  headers: Record<string, string> = {},
) {
  return new Request(`http://localhost/api/posts/${POST_ID}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

function makeGetRequest() {
  return new Request(`http://localhost/api/posts/${POST_ID}/comments`)
}

const mockComment = {
  id: 'comment-ulid',
  postId: POST_ID,
  parentId: null,
  username: 'tester',
  body: 'Great post!',
  status: 'pending',
  createdAt: new Date('2024-01-01'),
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRatelimitHolder.value = { limit: jest.fn() }
  mockRatelimitHolder.value.limit.mockResolvedValue({ success: true })
  mockGetPostMeta.mockResolvedValue({
    status: 'published',
    commentsEnabled: true,
  })
  mockVerifyTurnstile.mockResolvedValue(true)
  mockCreateComment.mockResolvedValue(mockComment)
  mockNotifyNewComment.mockResolvedValue(undefined)
  mockGetApprovedCommentsByPost.mockResolvedValue([mockComment])
})

describe('GET /api/posts/[id]/comments', () => {
  it('returns approved comments', async () => {
    const res = await GET(makeGetRequest(), makeCtx())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.comments).toHaveLength(1)
    expect(mockGetApprovedCommentsByPost).toHaveBeenCalledWith(POST_ID)
  })

  it('returns 500 when query throws', async () => {
    mockGetApprovedCommentsByPost.mockRejectedValue(new Error('db error'))
    const res = await GET(makeGetRequest(), makeCtx())
    expect(res.status).toBe(500)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

describe('POST /api/posts/[id]/comments', () => {
  it('creates comment and returns 201', async () => {
    const res = await POST(makePostRequest(), makeCtx())
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.comment).toEqual(
      expect.objectContaining({ username: 'tester' }),
    )
  })

  it('returns 429 when rate limited', async () => {
    mockRatelimitHolder.value!.limit.mockResolvedValue({ success: false })
    const res = await POST(makePostRequest(), makeCtx())
    expect(res.status).toBe(429)
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new Request(`http://localhost/api/posts/${POST_ID}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await POST(req, makeCtx())
    expect(res.status).toBe(400)
  })

  it('returns 400 when body fails validation', async () => {
    const res = await POST(makePostRequest({ username: '' }), makeCtx())
    expect(res.status).toBe(400)
  })

  it('ignores honeypot submissions silently', async () => {
    const res = await POST(
      makePostRequest({ ...validBody, honeypot: 'bot' }),
      makeCtx(),
    )
    expect(res.status).toBe(200)
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('returns 422 when captcha invalid', async () => {
    mockVerifyTurnstile.mockResolvedValue(false)
    const res = await POST(makePostRequest(), makeCtx())
    expect(res.status).toBe(422)
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('returns 404 when post not found', async () => {
    mockGetPostMeta.mockResolvedValue(null)
    const res = await POST(makePostRequest(), makeCtx())
    expect(res.status).toBe(404)
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('returns 404 when post is archived', async () => {
    mockGetPostMeta.mockResolvedValue({
      status: 'archived',
      commentsEnabled: true,
    })
    const res = await POST(makePostRequest(), makeCtx())
    expect(res.status).toBe(404)
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('allows comments on draft posts', async () => {
    mockGetPostMeta.mockResolvedValue({
      status: 'draft',
      commentsEnabled: true,
    })
    const res = await POST(makePostRequest(), makeCtx())
    expect(res.status).toBe(201)
  })

  it('returns 403 when comments are disabled', async () => {
    mockGetPostMeta.mockResolvedValue({
      status: 'published',
      commentsEnabled: false,
    })
    const res = await POST(makePostRequest(), makeCtx())
    expect(res.status).toBe(403)
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('notifies admin after comment created', async () => {
    await POST(makePostRequest(), makeCtx())
    expect(mockNotifyNewComment).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'tester', postTitle: 'My Post' }),
    )
  })

  it('supports optional parentId', async () => {
    const replyBody = { ...validBody, parentId: 'parent-comment-id' }
    const res = await POST(makePostRequest(replyBody), makeCtx())
    expect(res.status).toBe(201)
    expect(mockCreateComment).toHaveBeenCalledWith(
      expect.objectContaining({ parentId: 'parent-comment-id' }),
    )
  })

  it('returns 500 when createComment throws', async () => {
    mockCreateComment.mockRejectedValue(new Error('db error'))
    const res = await POST(makePostRequest(), makeCtx())
    expect(res.status).toBe(500)
    expect(mockLoggerError).toHaveBeenCalled()
  })

  it('uses x-forwarded-for for rate limit key', async () => {
    await POST(
      makePostRequest(validBody, { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }),
      makeCtx(),
    )
    expect(mockRatelimitHolder.value!.limit).toHaveBeenCalledWith(
      'comment:1.2.3.4',
    )
  })

  it('falls back to anonymous ip when no headers', async () => {
    await POST(makePostRequest(), makeCtx())
    expect(mockRatelimitHolder.value!.limit).toHaveBeenCalledWith(
      'comment:anonymous',
    )
  })

  it('skips rate limit check when ratelimit is null', async () => {
    mockRatelimitHolder.value = null
    const res = await POST(makePostRequest(), makeCtx())
    expect(res.status).toBe(201)
  })

  it('collapses 3+ consecutive newlines to 2 before saving', async () => {
    const res = await POST(
      makePostRequest({ ...validBody, body: 'Hello\n\n\n\nWorld' }),
      makeCtx(),
    )
    expect(res.status).toBe(201)
    expect(mockCreateComment).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'Hello\n\nWorld' }),
    )
    expect(mockNotifyNewComment).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'Hello\n\nWorld' }),
    )
  })

  it('strips HTML tags from body before saving', async () => {
    const res = await POST(
      makePostRequest({ ...validBody, body: 'Nice <b>post</b>!' }),
      makeCtx(),
    )
    expect(res.status).toBe(201)
    expect(mockCreateComment).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'Nice post!' }),
    )
  })

  it('strips HTML tags from username before saving', async () => {
    const res = await POST(
      makePostRequest({ ...validBody, username: '<b>hacker</b>' }),
      makeCtx(),
    )
    expect(res.status).toBe(201)
    expect(mockCreateComment).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'hacker' }),
    )
    expect(mockNotifyNewComment).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'hacker' }),
    )
  })
})

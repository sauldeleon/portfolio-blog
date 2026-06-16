/**
 * @jest-environment node
 */
const mockGetCommentById = jest.fn()
const mockUpdateCommentStatus = jest.fn()
const mockDeleteComment = jest.fn()
const mockRequireAuth = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@web/lib/db/queries/comments', () => ({
  getCommentById: (...args: unknown[]) => mockGetCommentById(...args),
  updateCommentStatus: (...args: unknown[]) => mockUpdateCommentStatus(...args),
  deleteComment: (...args: unknown[]) => mockDeleteComment(...args),
}))
jest.mock('@web/lib/api/parseRequest', () => ({
  requireAuth: () => mockRequireAuth(),
}))
jest.mock('@web/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}))

const { PATCH, DELETE } = require('./route') as {
  PATCH: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>
  DELETE: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>
}

const mockSession = { user: { role: 'editor' } }
const COMMENT_ID = 'comment-ulid-123'

function makeCtx(id = COMMENT_ID) {
  return { params: Promise.resolve({ id }) }
}

const mockComment = {
  id: COMMENT_ID,
  postId: 'p1',
  parentId: null,
  username: 'tester',
  body: 'hi',
  status: 'pending',
  createdAt: new Date('2024-01-01'),
}

function makePatchRequest(body: unknown = { status: 'approved' }) {
  return new Request(`http://localhost/api/comments/${COMMENT_ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeDeleteRequest() {
  return new Request(`http://localhost/api/comments/${COMMENT_ID}`, {
    method: 'DELETE',
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRequireAuth.mockResolvedValue({ ok: true, session: mockSession })
  mockGetCommentById.mockResolvedValue(mockComment)
  mockUpdateCommentStatus.mockResolvedValue({
    ...mockComment,
    status: 'approved',
  })
  mockDeleteComment.mockResolvedValue(true)
})

describe('PATCH /api/comments/[id]', () => {
  it('updates comment status and returns comment', async () => {
    const res = await PATCH(makePatchRequest(), makeCtx())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.comment.status).toBe('approved')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      }),
    })
    const res = await PATCH(makePatchRequest(), makeCtx())
    expect(res.status).toBe(401)
    expect(mockUpdateCommentStatus).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new Request(`http://localhost/api/comments/${COMMENT_ID}`, {
      method: 'PATCH',
      body: 'not-json',
    })
    const res = await PATCH(req, makeCtx())
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid status value', async () => {
    const res = await PATCH(makePatchRequest({ status: 'invalid' }), makeCtx())
    expect(res.status).toBe(400)
  })

  it('returns 404 when comment not found', async () => {
    mockUpdateCommentStatus.mockResolvedValue(null)
    const res = await PATCH(makePatchRequest(), makeCtx())
    expect(res.status).toBe(404)
  })

  it('returns 500 when update throws', async () => {
    mockUpdateCommentStatus.mockRejectedValue(new Error('db error'))
    const res = await PATCH(makePatchRequest(), makeCtx())
    expect(res.status).toBe(500)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

describe('DELETE /api/comments/[id]', () => {
  it('deletes comment and returns ok', async () => {
    const res = await DELETE(makeDeleteRequest(), makeCtx())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      }),
    })
    const res = await DELETE(makeDeleteRequest(), makeCtx())
    expect(res.status).toBe(401)
    expect(mockDeleteComment).not.toHaveBeenCalled()
  })

  it('returns 404 when comment not found', async () => {
    mockGetCommentById.mockResolvedValue(null)
    const res = await DELETE(makeDeleteRequest(), makeCtx())
    expect(res.status).toBe(404)
    expect(mockDeleteComment).not.toHaveBeenCalled()
  })

  it('returns 500 when delete throws', async () => {
    mockDeleteComment.mockRejectedValue(new Error('db error'))
    const res = await DELETE(makeDeleteRequest(), makeCtx())
    expect(res.status).toBe(500)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

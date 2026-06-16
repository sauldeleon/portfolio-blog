import { db } from '../index'
import {
  createComment,
  deleteComment,
  getApprovedCommentsByPost,
  getCommentById,
  getCommentsAdmin,
  updateCommentStatus,
} from './comments'

jest.mock('../index', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('ulid', () => ({ ulid: () => '01JWTEST000000000000000000' }))

const mockDb = db as unknown as {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
}

function makeChain(resolved: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['from', 'where', 'values', 'set', 'returning', 'orderBy']
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain)
  }
  chain.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(resolved).then(resolve)
  chain.catch = jest.fn().mockReturnThis()
  chain.finally = jest.fn().mockReturnThis()
  return chain
}

const now = new Date('2024-01-01T00:00:00.000Z')

const mockRow = {
  id: '01JWTEST000000000000000000',
  postId: 'post-id-1',
  parentId: null,
  username: 'tester',
  body: 'Great post!',
  status: 'approved',
  createdAt: now,
}

const mappedRow = {
  id: mockRow.id,
  postId: mockRow.postId,
  parentId: null,
  username: mockRow.username,
  body: mockRow.body,
  status: 'approved',
  createdAt: now,
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getApprovedCommentsByPost', () => {
  it('returns approved comments for post', async () => {
    mockDb.select.mockReturnValue(makeChain([mockRow]))
    const result = await getApprovedCommentsByPost('post-id-1')
    expect(result).toEqual([mappedRow])
  })

  it('returns empty array when none found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getApprovedCommentsByPost('post-id-1')
    expect(result).toEqual([])
  })
})

describe('getCommentsAdmin', () => {
  it('returns all comments with no filters', async () => {
    mockDb.select.mockReturnValue(makeChain([mockRow]))
    const result = await getCommentsAdmin({})
    expect(result).toEqual([mappedRow])
  })

  it('filters by postId', async () => {
    mockDb.select.mockReturnValue(makeChain([mockRow]))
    const result = await getCommentsAdmin({ postId: 'post-id-1' })
    expect(result).toEqual([mappedRow])
  })

  it('filters by status', async () => {
    mockDb.select.mockReturnValue(makeChain([mockRow]))
    const result = await getCommentsAdmin({ status: 'approved' })
    expect(result).toEqual([mappedRow])
  })

  it('filters top-level comments with parentId null', async () => {
    mockDb.select.mockReturnValue(makeChain([mockRow]))
    const result = await getCommentsAdmin({ parentId: null })
    expect(result).toEqual([mappedRow])
  })

  it('filters replies by parentId', async () => {
    const replyRow = { ...mockRow, parentId: 'parent-id' }
    mockDb.select.mockReturnValue(makeChain([replyRow]))
    const result = await getCommentsAdmin({ parentId: 'parent-id' })
    expect(result[0].parentId).toBe('parent-id')
  })

  it('returns empty array when none found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getCommentsAdmin({})
    expect(result).toEqual([])
  })
})

describe('getCommentById', () => {
  it('returns comment when found', async () => {
    mockDb.select.mockReturnValue(makeChain([mockRow]))
    const result = await getCommentById('01JWTEST000000000000000000')
    expect(result).toEqual(mappedRow)
  })

  it('returns null when not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getCommentById('missing-id')
    expect(result).toBeNull()
  })
})

describe('createComment', () => {
  it('inserts and returns comment', async () => {
    const pendingRow = { ...mockRow, status: 'pending' }
    mockDb.insert.mockReturnValue(makeChain([pendingRow]))
    const result = await createComment({
      postId: 'post-id-1',
      username: 'tester',
      body: 'Great post!',
    })
    expect(result.status).toBe('pending')
    expect(result.username).toBe('tester')
  })

  it('supports optional parentId', async () => {
    const replyRow = { ...mockRow, parentId: 'parent-id', status: 'pending' }
    mockDb.insert.mockReturnValue(makeChain([replyRow]))
    const result = await createComment({
      postId: 'post-id-1',
      parentId: 'parent-id',
      username: 'tester',
      body: 'Reply!',
    })
    expect(result.parentId).toBe('parent-id')
  })
})

describe('updateCommentStatus', () => {
  it('returns updated comment when found', async () => {
    const approvedRow = { ...mockRow, status: 'approved' }
    mockDb.update.mockReturnValue(makeChain([approvedRow]))
    const result = await updateCommentStatus(
      '01JWTEST000000000000000000',
      'approved',
    )
    expect(result?.status).toBe('approved')
  })

  it('returns null when not found', async () => {
    mockDb.update.mockReturnValue(makeChain([]))
    const result = await updateCommentStatus('missing-id', 'approved')
    expect(result).toBeNull()
  })
})

describe('deleteComment', () => {
  it('returns true when deleted', async () => {
    mockDb.delete.mockReturnValue(makeChain([mockRow]))
    const result = await deleteComment('01JWTEST000000000000000000')
    expect(result).toBe(true)
  })

  it('returns false when not found', async () => {
    mockDb.delete.mockReturnValue(makeChain([]))
    const result = await deleteComment('missing-id')
    expect(result).toBe(false)
  })
})

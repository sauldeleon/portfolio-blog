import { db } from '../index'
import { getAllTags, getAllTagsAdmin, getPostCountPerTag } from './tags'

jest.mock('../index', () => ({
  db: {
    select: jest.fn(),
    execute: jest.fn(),
  },
}))

const mockDb = db as unknown as { select: jest.Mock; execute: jest.Mock }

function makeChain(resolved: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['from', 'where', 'orderBy']
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain)
  }
  chain.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(resolved).then(resolve)
  chain.catch = jest.fn().mockReturnThis()
  chain.finally = jest.fn().mockReturnThis()
  return chain
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getAllTags', () => {
  it('returns deduplicated sorted tags from published posts', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        { tag: 'typescript' },
        { tag: 'javascript' },
        { tag: 'typescript' },
      ]),
    )
    const result = await getAllTags()
    expect(result).toEqual(['javascript', 'typescript'])
  })

  it('returns empty array when no published posts', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getAllTags()
    expect(result).toEqual([])
  })

  it('deduplicates tags across posts', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        { tag: 'react' },
        { tag: 'next' },
        { tag: 'react' },
        { tag: 'next' },
      ]),
    )
    const result = await getAllTags()
    expect(result).toEqual(['next', 'react'])
    expect(result).toHaveLength(2)
  })
})

describe('getAllTagsAdmin', () => {
  it('returns deduplicated sorted tags from all non-deleted posts', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        { tag: 'typescript' },
        { tag: 'javascript' },
        { tag: 'typescript' },
      ]),
    )
    const result = await getAllTagsAdmin()
    expect(result).toEqual(['javascript', 'typescript'])
  })

  it('returns empty array when no posts', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getAllTagsAdmin()
    expect(result).toEqual([])
  })
})

describe('getPostCountPerTag', () => {
  it('returns tags with counts ordered by count desc', async () => {
    mockDb.execute.mockResolvedValue({
      rows: [
        { tag: 'react', count: 5 },
        { tag: 'typescript', count: 3 },
      ],
    })
    const result = await getPostCountPerTag()
    expect(result).toEqual([
      { tag: 'react', count: 5 },
      { tag: 'typescript', count: 3 },
    ])
  })

  it('returns empty array when no published posts', async () => {
    mockDb.execute.mockResolvedValue({ rows: [] })
    const result = await getPostCountPerTag()
    expect(result).toEqual([])
  })

  it('excludes the given post id when provided', async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ tag: 'react', count: 4 }],
    })
    const result = await getPostCountPerTag('post-ulid-01')
    expect(result).toEqual([{ tag: 'react', count: 4 }])
    expect(mockDb.execute).toHaveBeenCalledTimes(1)
  })

  it('filters by a single category', async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ tag: 'react', count: 2 }],
    })
    const result = await getPostCountPerTag(undefined, {
      categories: ['engineering'],
    })
    expect(result).toEqual([{ tag: 'react', count: 2 }])
    expect(mockDb.execute).toHaveBeenCalledTimes(1)
  })

  it('filters by multiple categories with OR logic', async () => {
    mockDb.execute.mockResolvedValue({
      rows: [
        { tag: 'react', count: 3 },
        { tag: 'css', count: 1 },
      ],
    })
    const result = await getPostCountPerTag(undefined, {
      categories: ['engineering', 'design'],
    })
    expect(result).toEqual([
      { tag: 'react', count: 3 },
      { tag: 'css', count: 1 },
    ])
    expect(mockDb.execute).toHaveBeenCalledTimes(1)
  })

  it('filters by year', async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ tag: 'react', count: 1 }],
    })
    const result = await getPostCountPerTag(undefined, { year: 2024 })
    expect(result).toEqual([{ tag: 'react', count: 1 }])
    expect(mockDb.execute).toHaveBeenCalledTimes(1)
  })

  it('filters by month', async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ tag: 'react', count: 1 }],
    })
    const result = await getPostCountPerTag(undefined, { month: 6 })
    expect(result).toEqual([{ tag: 'react', count: 1 }])
    expect(mockDb.execute).toHaveBeenCalledTimes(1)
  })

  it('applies excludeId and multiple filters together', async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ tag: 'typescript', count: 2 }],
    })
    const result = await getPostCountPerTag('hero-id', {
      categories: ['engineering'],
      year: 2024,
      month: 3,
    })
    expect(result).toEqual([{ tag: 'typescript', count: 2 }])
    expect(mockDb.execute).toHaveBeenCalledTimes(1)
  })

  it('ignores empty categories array', async () => {
    mockDb.execute.mockResolvedValue({ rows: [] })
    const result = await getPostCountPerTag(undefined, { categories: [] })
    expect(result).toEqual([])
    expect(mockDb.execute).toHaveBeenCalledTimes(1)
  })
})

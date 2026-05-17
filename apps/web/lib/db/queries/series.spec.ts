import { db } from '../index'
import {
  ensureSeries,
  getAllSeriesWithTranslations,
  getPostsForSeries,
  getSeriesForAdmin,
  seriesOrderExistsForSeries,
  upsertSeriesTranslation,
} from './series'

jest.mock('../index', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}))

const mockDb = db as unknown as {
  select: jest.Mock
  insert: jest.Mock
}

function makeChain(resolved: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = [
    'from',
    'leftJoin',
    'orderBy',
    'where',
    'groupBy',
    'limit',
    'values',
    'onConflictDoNothing',
    'onConflictDoUpdate',
  ]
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

describe('getAllSeriesWithTranslations', () => {
  it('returns empty array when no series exist', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([]))
      .mockReturnValueOnce(makeChain([]))
    const result = await getAllSeriesWithTranslations()
    expect(result).toEqual([])
  })

  it('returns series with their translations and nextOrder grouped', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([
          { id: 'series-a', locale: 'en', title: 'Series A EN' },
          { id: 'series-a', locale: 'es', title: 'Series A ES' },
          { id: 'series-b', locale: 'en', title: 'Series B EN' },
        ]),
      )
      .mockReturnValueOnce(
        makeChain([
          { seriesId: 'series-a', maxOrder: 2 },
          { seriesId: 'series-b', maxOrder: 0 },
        ]),
      )
    const result = await getAllSeriesWithTranslations()
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 'series-a',
      nextOrder: 3,
      translations: [
        { locale: 'en', title: 'Series A EN' },
        { locale: 'es', title: 'Series A ES' },
      ],
    })
    expect(result[1]).toEqual({
      id: 'series-b',
      nextOrder: 1,
      translations: [{ locale: 'en', title: 'Series B EN' }],
    })
  })

  it('defaults nextOrder to 1 when series has no posts', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([{ id: 'series-a', locale: 'en', title: 'Series A EN' }]),
      )
      .mockReturnValueOnce(makeChain([]))
    const result = await getAllSeriesWithTranslations()
    expect(result[0].nextOrder).toBe(1)
  })

  it('returns series with empty translations when locale/title are null', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([{ id: 'series-a', locale: null, title: null }]),
      )
      .mockReturnValueOnce(makeChain([]))
    const result = await getAllSeriesWithTranslations()
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'series-a',
      nextOrder: 1,
      translations: [],
    })
  })
})

describe('getSeriesForAdmin', () => {
  it('returns empty array when no series exist', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([]))
      .mockReturnValueOnce(makeChain([]))
    const result = await getSeriesForAdmin()
    expect(result).toEqual([])
  })

  it('returns series with translations and postCount grouped', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([
          { id: 'series-a', locale: 'en', title: 'Series A EN' },
          { id: 'series-a', locale: 'es', title: 'Series A ES' },
          { id: 'series-b', locale: null, title: null },
        ]),
      )
      .mockReturnValueOnce(makeChain([{ seriesId: 'series-a', postCount: 3 }]))
    const result = await getSeriesForAdmin()
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 'series-a',
      postCount: 3,
      translations: [
        { locale: 'en', title: 'Series A EN' },
        { locale: 'es', title: 'Series A ES' },
      ],
    })
    expect(result[1]).toEqual({
      id: 'series-b',
      postCount: 0,
      translations: [],
    })
  })

  it('defaults postCount to 0 when series has no posts', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([{ id: 'series-a', locale: 'en', title: 'Series A' }]),
      )
      .mockReturnValueOnce(makeChain([]))
    const result = await getSeriesForAdmin()
    expect(result[0].postCount).toBe(0)
  })
})

describe('getPostsForSeries', () => {
  it('returns posts for the given series ordered by seriesOrder', async () => {
    const mockPosts = [
      { id: 'post-1', seriesOrder: 1, enSlug: 'my-post', enTitle: 'My Post' },
      { id: 'post-2', seriesOrder: 2, enSlug: null, enTitle: null },
    ]
    mockDb.select.mockReturnValue(makeChain(mockPosts))
    const result = await getPostsForSeries('my-series')
    expect(result).toEqual(mockPosts)
    expect(mockDb.select).toHaveBeenCalledTimes(1)
  })
})

describe('seriesOrderExistsForSeries', () => {
  it('returns true when a post with that order exists', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'post-1' }]))
    const result = await seriesOrderExistsForSeries('my-series', 1)
    expect(result).toBe(true)
  })

  it('returns false when no post with that order exists', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await seriesOrderExistsForSeries('my-series', 2)
    expect(result).toBe(false)
  })

  it('accepts excludePostId to exclude current post from check', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    await seriesOrderExistsForSeries('my-series', 1, 'post-abc')
    expect(mockDb.select).toHaveBeenCalledTimes(1)
  })
})

describe('ensureSeries', () => {
  it('inserts series with onConflictDoNothing', async () => {
    const insertChain = makeChain([])
    mockDb.insert.mockReturnValue(insertChain)

    await ensureSeries('my-series')

    expect(mockDb.insert).toHaveBeenCalledTimes(1)
    expect(insertChain.onConflictDoNothing).toHaveBeenCalledTimes(1)
  })
})

describe('upsertSeriesTranslation', () => {
  it('inserts series and upserts translation', async () => {
    const insertChain = makeChain([])
    mockDb.insert.mockReturnValue(insertChain)

    await upsertSeriesTranslation('my-series', 'en', 'My Series')

    expect(mockDb.insert).toHaveBeenCalledTimes(2)
  })
})

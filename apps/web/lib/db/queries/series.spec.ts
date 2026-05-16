import { db } from '../index'
import { getAllSeriesWithTranslations, upsertSeriesTranslation } from './series'

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
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getAllSeriesWithTranslations()
    expect(result).toEqual([])
  })

  it('returns series with their translations grouped', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        { id: 'series-a', locale: 'en', title: 'Series A EN' },
        { id: 'series-a', locale: 'es', title: 'Series A ES' },
        { id: 'series-b', locale: 'en', title: 'Series B EN' },
      ]),
    )
    const result = await getAllSeriesWithTranslations()
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 'series-a',
      translations: [
        { locale: 'en', title: 'Series A EN' },
        { locale: 'es', title: 'Series A ES' },
      ],
    })
    expect(result[1]).toEqual({
      id: 'series-b',
      translations: [{ locale: 'en', title: 'Series B EN' }],
    })
  })

  it('returns series with empty translations when locale/title are null', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ id: 'series-a', locale: null, title: null }]),
    )
    const result = await getAllSeriesWithTranslations()
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ id: 'series-a', translations: [] })
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

import { db } from '../index'
import { getAllTags } from './tags'

jest.mock('../index', () => ({
  db: {
    select: jest.fn(),
  },
}))

const mockDb = db as unknown as { select: jest.Mock }

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

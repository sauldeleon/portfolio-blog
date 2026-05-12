import { db } from '../index'
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategoryById,
  updateCategoryBySlug,
} from './categories'

jest.mock('../index', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockDb = db as unknown as {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
}

function makeChain(resolved: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = [
    'from',
    'innerJoin',
    'leftJoin',
    'where',
    'orderBy',
    'limit',
    'groupBy',
    'values',
    'set',
    'returning',
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

const mockCategory = {
  id: 1,
  slug: 'engineering',
  name: 'Engineering',
  description: null,
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getCategories', () => {
  it('returns categories with post counts', async () => {
    const row = { ...mockCategory, postCount: 5 }
    mockDb.select.mockReturnValue(makeChain([row]))
    const result = await getCategories()
    expect(result).toEqual([row])
    expect(mockDb.select).toHaveBeenCalled()
  })

  it('returns category with 0 post count when no posts', async () => {
    const row = { ...mockCategory, postCount: 0 }
    mockDb.select.mockReturnValue(makeChain([row]))
    const result = await getCategories()
    expect(result[0].postCount).toBe(0)
  })
})

describe('getCategoryById', () => {
  it('returns category when found', async () => {
    mockDb.select.mockReturnValue(makeChain([mockCategory]))
    const result = await getCategoryById(1)
    expect(result).toEqual(mockCategory)
  })

  it('returns null when not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getCategoryById(99)
    expect(result).toBeNull()
  })
})

describe('getCategoryBySlug', () => {
  it('returns category when found', async () => {
    mockDb.select.mockReturnValue(makeChain([mockCategory]))
    const result = await getCategoryBySlug('engineering')
    expect(result).toEqual(mockCategory)
  })

  it('returns null when not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getCategoryBySlug('nonexistent')
    expect(result).toBeNull()
  })
})

describe('createCategory', () => {
  it('inserts and returns new category', async () => {
    mockDb.insert.mockReturnValue(makeChain([mockCategory]))
    const result = await createCategory(mockCategory)
    expect(result).toEqual(mockCategory)
    expect(mockDb.insert).toHaveBeenCalled()
  })
})

describe('updateCategoryBySlug', () => {
  it('updates name and description, returns updated row', async () => {
    const updated = { ...mockCategory, name: 'Updated Name' }
    mockDb.update.mockReturnValue(makeChain([updated]))
    const result = await updateCategoryBySlug('engineering', {
      name: 'Updated Name',
    })
    expect(result).toMatchObject({ name: 'Updated Name' })
  })

  it('returns null when category not found', async () => {
    mockDb.update.mockReturnValue(makeChain([]))
    const result = await updateCategoryBySlug('nonexistent', { name: 'X' })
    expect(result).toBeNull()
  })
})

describe('updateCategoryById', () => {
  it('updates name and description by id, returns updated row', async () => {
    const updated = { ...mockCategory, name: 'Updated Name' }
    mockDb.update.mockReturnValue(makeChain([updated]))
    const result = await updateCategoryById(1, { name: 'Updated Name' })
    expect(result).toMatchObject({ name: 'Updated Name' })
  })

  it('returns null when category not found', async () => {
    mockDb.update.mockReturnValue(makeChain([]))
    const result = await updateCategoryById(99, { name: 'X' })
    expect(result).toBeNull()
  })
})

describe('deleteCategory', () => {
  it('calls delete on the categories table', async () => {
    const chain = makeChain(undefined)
    mockDb.delete.mockReturnValue(chain)
    await deleteCategory('engineering')
    expect(mockDb.delete).toHaveBeenCalled()
  })
})

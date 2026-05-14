import { db } from '../index'
import {
  createCategory,
  createCategoryTranslation,
  deleteCategory,
  getCategories,
  getCategoriesForAdmin,
  getCategoryById,
  getCategoryByLocaleSlug,
  getCategoryBySlug,
  getCategoryTranslations,
  upsertCategoryTranslation,
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

const mockCategory = { id: 1, slug: 'engineering' }
const mockTranslationEN = {
  categorySlug: 'engineering',
  locale: 'en' as const,
  name: 'Engineering',
  description: null,
  slug: 'engineering',
}
const mockTranslationES = {
  categorySlug: 'engineering',
  locale: 'es' as const,
  name: 'Ingeniería',
  description: null,
  slug: 'ingenieria',
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getCategories', () => {
  it('returns categories with post counts and locale name', async () => {
    const row = {
      id: 1,
      slug: 'engineering',
      name: 'Engineering',
      description: null,
      localeSlug: 'engineering',
      postCount: 5,
      publishedPostCount: 3,
    }
    mockDb.select.mockReturnValue(makeChain([row]))
    const result = await getCategories('en')
    expect(result).toEqual([row])
    expect(mockDb.select).toHaveBeenCalled()
  })

  it('defaults to en locale', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    await getCategories()
    expect(mockDb.select).toHaveBeenCalled()
  })

  it('returns empty array when no categories', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getCategories('en')
    expect(result).toEqual([])
  })
})

describe('getCategoriesForAdmin', () => {
  it('returns categories with translations grouped', async () => {
    const countRow = {
      id: 1,
      slug: 'engineering',
      postCount: 5,
      publishedPostCount: 3,
    }
    mockDb.select
      .mockReturnValueOnce(makeChain([countRow]))
      .mockReturnValueOnce(makeChain([mockTranslationEN, mockTranslationES]))
    const result = await getCategoriesForAdmin()
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('engineering')
    expect(result[0].translations).toHaveLength(2)
    expect(result[0].translations[0].locale).toBe('en')
    expect(result[0].translations[1].locale).toBe('es')
  })

  it('returns empty translations array when none exist', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([
          { id: 1, slug: 'new-cat', postCount: 0, publishedPostCount: 0 },
        ]),
      )
      .mockReturnValueOnce(makeChain([]))
    const result = await getCategoriesForAdmin()
    expect(result[0].translations).toEqual([])
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

describe('getCategoryByLocaleSlug', () => {
  it('returns canonical slug when found', async () => {
    mockDb.select.mockReturnValue(makeChain([{ canonicalSlug: 'engineering' }]))
    const result = await getCategoryByLocaleSlug('ingenieria', 'es')
    expect(result).toEqual({ canonicalSlug: 'engineering' })
  })

  it('returns null when not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getCategoryByLocaleSlug('nada', 'es')
    expect(result).toBeNull()
  })
})

describe('getCategoryTranslations', () => {
  it('returns all translations for a category', async () => {
    mockDb.select.mockReturnValue(
      makeChain([mockTranslationEN, mockTranslationES]),
    )
    const result = await getCategoryTranslations('engineering')
    expect(result).toHaveLength(2)
    expect(result[0].locale).toBe('en')
    expect(result[1].locale).toBe('es')
  })

  it('returns empty array when no translations', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getCategoryTranslations('empty')
    expect(result).toEqual([])
  })
})

describe('createCategory', () => {
  it('inserts canonical slug and returns the row', async () => {
    mockDb.insert.mockReturnValue(makeChain([mockCategory]))
    const result = await createCategory('engineering')
    expect(result).toEqual(mockCategory)
    expect(mockDb.insert).toHaveBeenCalled()
  })
})

describe('createCategoryTranslation', () => {
  it('inserts translation and returns it', async () => {
    mockDb.insert.mockReturnValue(makeChain([mockTranslationEN]))
    const result = await createCategoryTranslation(mockTranslationEN)
    expect(result.name).toBe('Engineering')
    expect(result.locale).toBe('en')
  })
})

describe('upsertCategoryTranslation', () => {
  it('upserts and returns the translation', async () => {
    const updated = { ...mockTranslationEN, name: 'Engineering Updated' }
    mockDb.insert.mockReturnValue(makeChain([updated]))
    const result = await upsertCategoryTranslation(updated)
    expect(result.name).toBe('Engineering Updated')
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

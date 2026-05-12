import { db } from '../index'
import {
  createPost,
  getAllPosts,
  getAllSeries,
  getPostById,
  getPostByPreviewToken,
  getPostBySlug,
  getPostTranslations,
  getPostsBySeries,
  getPublishedPostCountByCategory,
  getPublishedPosts,
  getPublishedPostsPaginated,
  getRelatedPosts,
  restorePost,
  slugExistsForLocale,
  softDeletePost,
  updatePost,
  updateTranslation,
} from './posts'

jest.mock('../index', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    execute: jest.fn(),
    transaction: jest.fn(),
  },
}))

jest.mock('ulid', () => ({ ulid: () => '01JWTEST000000000000000000' }))

const mockDb = db as unknown as {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
  execute: jest.Mock
  transaction: jest.Mock
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
    'offset',
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

const mockPost = {
  id: '01JWTEST000000000000000000',
  category: 'engineering',
  tags: ['js'],
  status: 'published',
  coverImage: null,
  seriesId: null,
  seriesOrder: null,
  publishedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
  scheduledAt: null,
  previewToken: null,
  author: 'admin',
}

const mockTranslation = {
  postId: '01JWTEST000000000000000000',
  locale: 'en' as const,
  title: 'Test Post',
  slug: 'test-post',
  excerpt: 'An excerpt',
  content: '# Hello',
}

const mockPublicPost = {
  id: mockPost.id,
  category: mockPost.category,
  tags: mockPost.tags,
  status: mockPost.status,
  coverImage: mockPost.coverImage,
  seriesId: mockPost.seriesId,
  seriesOrder: mockPost.seriesOrder,
  publishedAt: mockPost.publishedAt,
  createdAt: mockPost.createdAt,
  updatedAt: mockPost.updatedAt,
  author: mockPost.author,
  title: mockTranslation.title,
  slug: mockTranslation.slug,
  excerpt: mockTranslation.excerpt,
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getPublishedPosts', () => {
  it('returns published posts for locale', async () => {
    mockDb.select.mockReturnValue(makeChain([mockPublicPost]))
    const result = await getPublishedPosts('en')
    expect(result).toEqual([mockPublicPost])
    expect(mockDb.select).toHaveBeenCalled()
  })

  it('returns empty array when no posts', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getPublishedPosts('es')
    expect(result).toEqual([])
  })
})

describe('getPostById', () => {
  it('returns post when found', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ ...mockPublicPost, content: '# Hello' }]),
    )
    const result = await getPostById('01JWTEST000000000000000000', 'en')
    expect(result).toMatchObject({ id: '01JWTEST000000000000000000' })
  })

  it('returns null when not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getPostById('nonexistent', 'en')
    expect(result).toBeNull()
  })
})

describe('getPostBySlug', () => {
  it('returns post when slug matches', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ ...mockPublicPost, content: '# Hello' }]),
    )
    const result = await getPostBySlug('en', 'test-post')
    expect(result).toMatchObject({ slug: 'test-post' })
  })

  it('returns null when slug not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getPostBySlug('en', 'missing-slug')
    expect(result).toBeNull()
  })
})

describe('getRelatedPosts', () => {
  it('returns related posts in same category', async () => {
    const relatedPost = {
      ...mockPublicPost,
      id: '01JWOTHER000000000000000000',
      slug: 'other-post',
      content: '# Related',
    }
    // First call: getPostById for current post
    mockDb.select
      .mockReturnValueOnce(
        makeChain([{ ...mockPublicPost, content: '# Hello' }]),
      )
      // Second call: related query
      .mockReturnValueOnce(makeChain([relatedPost]))
    const result = await getRelatedPosts('01JWTEST000000000000000000', 'en')
    expect(result).toEqual([relatedPost])
  })

  it('returns empty array when current post not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getRelatedPosts('nonexistent', 'en')
    expect(result).toEqual([])
  })
})

describe('getAllSeries', () => {
  it('returns distinct series with post counts', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        { seriesId: 'building-a-blog', postCount: 3 },
        { seriesId: 'react-patterns', postCount: 2 },
      ]),
    )
    const result = await getAllSeries()
    expect(result).toEqual([
      { seriesId: 'building-a-blog', postCount: 3 },
      { seriesId: 'react-patterns', postCount: 2 },
    ])
  })

  it('returns empty array when no series exist', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getAllSeries()
    expect(result).toEqual([])
  })
})

describe('getPostsBySeries', () => {
  it('returns posts ordered by seriesOrder', async () => {
    const part1 = { ...mockPublicPost, seriesId: 'my-series', seriesOrder: 1 }
    const part2 = {
      ...mockPublicPost,
      id: '01H00000000000000000000001',
      seriesId: 'my-series',
      seriesOrder: 2,
    }
    mockDb.select.mockReturnValue(makeChain([part1, part2]))
    const result = await getPostsBySeries('my-series', 'en')
    expect(result).toEqual([part1, part2])
    expect(mockDb.select).toHaveBeenCalled()
  })

  it('returns empty array when series not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getPostsBySeries('nonexistent', 'en')
    expect(result).toEqual([])
  })
})

describe('getPostByPreviewToken', () => {
  it('returns post with translations when token matches', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([mockPost]))
      .mockReturnValueOnce(makeChain([mockTranslation]))
    const result = await getPostByPreviewToken('secret-token')
    expect(result).toMatchObject({
      post: mockPost,
      translations: [mockTranslation],
    })
  })

  it('returns null when token not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getPostByPreviewToken('bad-token')
    expect(result).toBeNull()
  })
})

describe('getAllPosts', () => {
  it('returns admin post list with both locale titles', async () => {
    const rawRow = {
      id: '01JWTEST000000000000000000',
      category: 'engineering',
      tags: ['js'],
      status: 'draft',
      cover_image: null,
      series_id: null,
      series_order: null,
      scheduled_at: null,
      published_at: null,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      preview_token: null,
      title_en: 'Test Post',
      slug_en: 'test-post',
      title_es: 'Post de Prueba',
      slug_es: 'post-de-prueba',
    }
    mockDb.execute.mockResolvedValue({ rows: [rawRow] })
    const result = await getAllPosts()
    expect(result[0]).toMatchObject({
      id: '01JWTEST000000000000000000',
      titleEn: 'Test Post',
      titleEs: 'Post de Prueba',
    })
  })
})

describe('createPost', () => {
  it('inserts post and translations in a transaction', async () => {
    const txInsertChain = makeChain([mockPost])
    const txMock = {
      insert: jest.fn().mockReturnValue(txInsertChain),
    }
    mockDb.transaction.mockImplementation(
      async (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
    )

    const result = await createPost(
      { category: 'engineering', tags: [], author: 'admin', status: 'draft' },
      { en: { title: 'Test', slug: 'test', excerpt: 'Ex', content: '# Hi' } },
    )
    expect(mockDb.transaction).toHaveBeenCalled()
    expect(txMock.insert).toHaveBeenCalledTimes(2) // posts + translations
    expect(result).toEqual(mockPost)
  })
})

describe('updatePost', () => {
  it('updates post and sets updatedAt', async () => {
    const updated = { ...mockPost, status: 'published' }
    mockDb.update.mockReturnValue(makeChain([updated]))
    const result = await updatePost('01JWTEST000000000000000000', {
      status: 'published',
    })
    expect(result).toMatchObject({ status: 'published' })
    expect(mockDb.update).toHaveBeenCalled()
  })

  it('returns null when post not found', async () => {
    mockDb.update.mockReturnValue(makeChain([]))
    const result = await updatePost('nonexistent', { status: 'published' })
    expect(result).toBeNull()
  })
})

describe('updateTranslation', () => {
  it('updates translation fields', async () => {
    const updated = { ...mockTranslation, title: 'New Title' }
    mockDb.update.mockReturnValue(makeChain([updated]))
    const result = await updateTranslation('01JWTEST000000000000000000', 'en', {
      title: 'New Title',
    })
    expect(result).toMatchObject({ title: 'New Title' })
  })

  it('returns null when translation not found', async () => {
    mockDb.update.mockReturnValue(makeChain([]))
    const result = await updateTranslation('nonexistent', 'en', { title: 'X' })
    expect(result).toBeNull()
  })
})

describe('softDeletePost', () => {
  it('sets deletedAt and status=archived atomically', async () => {
    const chain = makeChain(undefined)
    const mockSet = chain.set as jest.Mock
    mockDb.update.mockReturnValue(chain)

    await softDeletePost('01JWTEST000000000000000000')

    expect(mockDb.update).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'archived',
        deletedAt: expect.any(Date),
      }),
    )
  })
})

describe('restorePost', () => {
  it('clears deletedAt and sets status=draft', async () => {
    const chain = makeChain(undefined)
    const mockSet = chain.set as jest.Mock
    mockDb.update.mockReturnValue(chain)

    await restorePost('01JWTEST000000000000000000')

    expect(mockDb.update).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft', deletedAt: null }),
    )
  })
})

describe('slugExistsForLocale', () => {
  it('returns true when slug exists for locale', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ postId: '01JWTEST000000000000000000' }]),
    )
    const result = await slugExistsForLocale('en', 'test-post')
    expect(result).toBe(true)
  })

  it('returns false when slug does not exist', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await slugExistsForLocale('en', 'nonexistent')
    expect(result).toBe(false)
  })

  it('excludes a specific postId when provided', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await slugExistsForLocale(
      'en',
      'test-post',
      '01JWTEST000000000000000000',
    )
    expect(result).toBe(false)
    expect(mockDb.select).toHaveBeenCalled()
  })
})

describe('getPostTranslations', () => {
  it('returns translations for a post', async () => {
    mockDb.select.mockReturnValue(makeChain([mockTranslation]))
    const result = await getPostTranslations('01JWTEST000000000000000000')
    expect(result).toEqual([mockTranslation])
  })

  it('returns empty array when post has no translations', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getPostTranslations('nonexistent')
    expect(result).toEqual([])
  })
})

describe('getPublishedPostsPaginated', () => {
  const mockPostWithContent = { ...mockPublicPost, content: '# Hello' }

  it('returns paginated data and total count', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([mockPostWithContent]))
      .mockReturnValueOnce(makeChain([{ count: 1 }]))
    const result = await getPublishedPostsPaginated({
      locale: 'en',
      page: 1,
      limit: 10,
    })
    expect(result.data).toEqual([mockPostWithContent])
    expect(result.total).toBe(1)
  })

  it('applies category filter', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([]))
      .mockReturnValueOnce(makeChain([{ count: 0 }]))
    const result = await getPublishedPostsPaginated({
      locale: 'en',
      page: 1,
      limit: 10,
      category: 'engineering',
    })
    expect(result.data).toEqual([])
    expect(result.total).toBe(0)
  })

  it('applies tag filter', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([mockPostWithContent]))
      .mockReturnValueOnce(makeChain([{ count: 1 }]))
    const result = await getPublishedPostsPaginated({
      locale: 'es',
      page: 1,
      limit: 10,
      tag: 'react',
    })
    expect(result.data).toEqual([mockPostWithContent])
    expect(result.total).toBe(1)
  })

  it('applies search query filter', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([]))
      .mockReturnValueOnce(makeChain([{ count: 0 }]))
    const result = await getPublishedPostsPaginated({
      locale: 'en',
      page: 2,
      limit: 5,
      q: 'hello',
    })
    expect(result.data).toEqual([])
    expect(result.total).toBe(0)
  })

  it('returns 0 total when count row is missing', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([]))
      .mockReturnValueOnce(makeChain([]))
    const result = await getPublishedPostsPaginated({
      locale: 'en',
      page: 1,
      limit: 10,
    })
    expect(result.total).toBe(0)
  })
})

describe('getPublishedPostCountByCategory', () => {
  it('returns count of published posts for category', async () => {
    mockDb.select.mockReturnValue(makeChain([{ count: 3 }]))
    const result = await getPublishedPostCountByCategory('engineering')
    expect(result).toBe(3)
  })

  it('returns 0 when no published posts', async () => {
    mockDb.select.mockReturnValue(makeChain([{ count: 0 }]))
    const result = await getPublishedPostCountByCategory('engineering')
    expect(result).toBe(0)
  })

  it('returns 0 when query returns no rows', async () => {
    mockDb.select.mockReturnValue(makeChain([]))
    const result = await getPublishedPostCountByCategory('nonexistent')
    expect(result).toBe(0)
  })
})

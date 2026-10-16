/**
 * @vitest-environment node
 */
import { unstable_cache } from 'next/cache'

import {
  getCachedCategories,
  getCachedCategoryByLocaleSlug,
  getCachedLatestPublishedPost,
  getCachedPostCountPerTag,
  getCachedPostPublishedDates,
  getCachedPublishedPosts,
  getCachedPublishedPostsPage,
  reviveDates,
} from './publicCache'

const { mockQueries } = vi.hoisted(() => ({
  mockQueries: {
    getLatestPublishedPost: vi.fn(),
    getPublishedPosts: vi.fn(),
    getCategoryByLocaleSlug: vi.fn(),
    getCategories: vi.fn(),
    getPostCountPerTag: vi.fn(),
    getPostPublishedDates: vi.fn(),
    getPublishedPostsPaginated: vi.fn(),
  },
}))

// Simulates the JSON round-trip unstable_cache applies to cached results.
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn(
    (fn: (...args: unknown[]) => Promise<unknown>) =>
      async (...args: unknown[]) =>
        JSON.parse(JSON.stringify(await fn(...args))),
  ),
}))

vi.mock('./posts', () => ({
  getLatestPublishedPost: mockQueries.getLatestPublishedPost,
  getPublishedPosts: mockQueries.getPublishedPosts,
  getPostPublishedDates: mockQueries.getPostPublishedDates,
  getPublishedPostsPaginated: mockQueries.getPublishedPostsPaginated,
}))
vi.mock('./categories', () => ({
  getCategoryByLocaleSlug: mockQueries.getCategoryByLocaleSlug,
  getCategories: mockQueries.getCategories,
}))
vi.mock('./tags', () => ({
  getPostCountPerTag: mockQueries.getPostCountPerTag,
}))

// Recorded when the module was imported, before the global beforeEach clears
// mock history.
const cacheCalls = [...vi.mocked(unstable_cache).mock.calls]

describe('publicCache', () => {
  it('caches every query under the posts tag with a one-day backstop', () => {
    expect(cacheCalls).toHaveLength(7)
    for (const [, keyParts, options] of cacheCalls) {
      expect(keyParts?.[0]).toBe('public-query')
      expect(options).toEqual({ tags: ['posts'], revalidate: 86400 })
    }
  })

  it('gives every query its own cache key', () => {
    const names = cacheCalls.map(([, keyParts]) => keyParts?.[1])
    expect(new Set(names).size).toBe(names.length)
  })

  it('revives Date fields after the cache round-trip', async () => {
    const publishedAt = new Date('2026-10-01T10:00:00.000Z')
    mockQueries.getLatestPublishedPost.mockResolvedValue({
      id: 'p1',
      title: 'A post',
      publishedAt,
    })
    const post = await getCachedLatestPublishedPost('en')
    expect(post?.publishedAt).toBeInstanceOf(Date)
    expect(post?.publishedAt).toEqual(publishedAt)
    expect(post?.title).toBe('A post')
  })

  it('passes the arguments through to the underlying queries', async () => {
    mockQueries.getCategoryByLocaleSlug.mockResolvedValue(null)
    mockQueries.getCategories.mockResolvedValue([])
    mockQueries.getPostCountPerTag.mockResolvedValue([])
    mockQueries.getPostPublishedDates.mockResolvedValue([])
    mockQueries.getPublishedPosts.mockResolvedValue([])

    await getCachedCategoryByLocaleSlug('montana', 'es')
    await getCachedCategories('es', 'hero', { tags: ['a'] })
    await getCachedPostCountPerTag('hero', { categories: ['c'] })
    await getCachedPostPublishedDates('en', 'hero')
    await getCachedPublishedPosts('es', { limit: 20 })

    expect(mockQueries.getCategoryByLocaleSlug).toHaveBeenCalledWith(
      'montana',
      'es',
    )
    expect(mockQueries.getCategories).toHaveBeenCalledWith('es', 'hero', {
      tags: ['a'],
    })
    expect(mockQueries.getPostCountPerTag).toHaveBeenCalledWith('hero', {
      categories: ['c'],
    })
    expect(mockQueries.getPostPublishedDates).toHaveBeenCalledWith('en', 'hero')
  })

  it('caches the reading time of each grid post instead of its content', async () => {
    mockQueries.getPublishedPostsPaginated.mockResolvedValue({
      total: 1,
      data: [
        {
          id: 'p1',
          content: 'word '.repeat(600),
          publishedAt: new Date('2026-10-01T10:00:00.000Z'),
        },
      ],
    })
    const page = await getCachedPublishedPostsPage({
      locale: 'en',
      page: 1,
      limit: 9,
    })
    expect(page.total).toBe(1)
    expect(page.data[0]).not.toHaveProperty('content')
    expect(page.data[0].readingTime).toBeGreaterThan(0)
    expect(page.data[0].publishedAt).toBeInstanceOf(Date)
  })
})

describe('reviveDates', () => {
  it('converts only date fields holding strings, recursively', () => {
    const revived = reviveDates({
      createdAt: '2026-01-01T00:00:00.000Z',
      title: '2026-01-01T00:00:00.000Z',
      nested: [{ updatedAt: '2026-02-01T00:00:00.000Z' }],
      deletedAt: null,
    })
    expect(revived.createdAt).toBeInstanceOf(Date)
    expect(revived.title).toBe('2026-01-01T00:00:00.000Z')
    expect(revived.nested[0].updatedAt).toBeInstanceOf(Date)
    expect(revived.deletedAt).toBeNull()
  })

  it('leaves Date instances and primitives untouched', () => {
    const date = new Date()
    expect(reviveDates(date)).toBe(date)
    expect(reviveDates(42)).toBe(42)
    expect(reviveDates(null)).toBeNull()
  })
})

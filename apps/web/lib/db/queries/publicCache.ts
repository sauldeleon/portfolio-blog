import { unstable_cache } from 'next/cache'

import { POSTS_CACHE_TAG } from '@web/lib/cache/revalidatePublicContent'
import { computeReadingTime } from '@web/utils/computeReadingTime'

import { getCategories, getCategoryByLocaleSlug } from './categories'
import {
  type PaginatedPostsParams,
  getLatestPublishedPost,
  getPostPublishedDates,
  getPublishedPosts,
  getPublishedPostsPaginated,
} from './posts'
import { getPostCountPerTag } from './tags'

const ONE_DAY = 86400
const DATE_KEYS = new Set([
  'publishedAt',
  'createdAt',
  'updatedAt',
  'scheduledAt',
  'deletedAt',
])

/** unstable_cache stores results as JSON, which turns Date fields into strings. */
export function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) return value.map(reviveDates) as T
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, field]) => [
        key,
        DATE_KEYS.has(key) && typeof field === 'string'
          ? new Date(field)
          : reviveDates(field),
      ]),
    ) as T
  }
  return value
}

/**
 * Caches a read-only query of published content across requests. Entries are
 * dropped by revalidatePublicContent() (posts tag) as soon as the admin changes
 * anything; the one-day revalidation is only a backstop.
 */
function cachedPublicQuery<Args extends unknown[], Result>(
  name: string,
  query: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  const cached = unstable_cache(query, ['public-query', name], {
    tags: [POSTS_CACHE_TAG],
    revalidate: ONE_DAY,
  })
  return async (...args) => reviveDates(await cached(...args))
}

export const getCachedLatestPublishedPost = cachedPublicQuery(
  'latest-published-post',
  getLatestPublishedPost,
)

export const getCachedPublishedPosts = cachedPublicQuery(
  'published-posts',
  getPublishedPosts,
)

export const getCachedCategoryByLocaleSlug = cachedPublicQuery(
  'category-by-locale-slug',
  getCategoryByLocaleSlug,
)

export const getCachedCategories = cachedPublicQuery(
  'categories',
  getCategories,
)

export const getCachedPostCountPerTag = cachedPublicQuery(
  'post-count-per-tag',
  getPostCountPerTag,
)

export const getCachedPostPublishedDates = cachedPublicQuery(
  'post-published-dates',
  getPostPublishedDates,
)

/**
 * The blog grid only needs each post's reading time, not its full content:
 * compute it before caching so neither the cache nor the page carries the
 * post bodies around.
 */
export const getCachedPublishedPostsPage = cachedPublicQuery(
  'published-posts-page',
  async (params: PaginatedPostsParams) => {
    const { data, total } = await getPublishedPostsPaginated(params)
    return {
      total,
      data: data.map(({ content, ...post }) => ({
        ...post,
        readingTime: computeReadingTime(content),
      })),
    }
  },
)

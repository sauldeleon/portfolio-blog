import { revalidatePath, revalidateTag } from 'next/cache'

/** Cache tag on every cached query that reads published posts. */
export const POSTS_CACHE_TAG = 'posts'

/** Public pages built from post data, as route patterns (all their params). */
const POST_ROUTES = [
  '/[lng]/blog/[id]/[slug]',
  '/[lng]/blog/[id]',
  '/[lng]/blog',
]

/** Static outputs that list posts. */
const POST_FEEDS = ['/sitemap.xml', '/feed.xml', '/feed.es.xml']

/**
 * Expires every public page and cached query that shows posts, so a change
 * made in the admin (or by the publish cron) is visible on the next request
 * instead of after the time-based revalidation.
 *
 * Route patterns are expired as a whole rather than per slug: a post can
 * appear on several pages (its own, the list, related posts, its series) and
 * an old slug must stop serving the previous version too.
 */
export function revalidatePublicContent() {
  revalidateTag(POSTS_CACHE_TAG, { expire: 0 })
  for (const route of POST_ROUTES) {
    revalidatePath(route, 'page')
  }
  for (const feed of POST_FEEDS) {
    revalidatePath(feed)
  }
}

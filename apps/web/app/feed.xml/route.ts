import { getPublishedPosts } from '@web/lib/db/queries/posts'
import { generateRSS } from '@web/lib/rss/generateRSS'

// Static, refreshed by revalidatePublicContent() whenever posts change; the
// time-based revalidation is only a backstop.
export const revalidate = 86400

export async function GET() {
  const posts = await getPublishedPosts('en', { limit: 20 })
  const rss = generateRSS(posts, 'en')
  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}

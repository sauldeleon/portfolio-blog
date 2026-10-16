import { getCachedPublishedPosts } from '@web/lib/db/queries/publicCache'
import { generateRSS } from '@web/lib/rss/generateRSS'

// Rendered on request (prerendering would need the database at build time),
// but from the cached query that revalidatePublicContent() expires whenever
// posts change, so the database is only hit after a change.
export const dynamic = 'force-dynamic'

export async function GET() {
  const posts = await getCachedPublishedPosts('es', { limit: 20 })
  const rss = generateRSS(posts, 'es')
  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}

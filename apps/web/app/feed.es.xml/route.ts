import { getPublishedPosts } from '@web/lib/db/queries/posts'
import { generateRSS } from '@web/lib/rss/generateRSS'

export const dynamic = 'force-dynamic'

export async function GET() {
  const allPosts = await getPublishedPosts('es')
  const posts = allPosts.slice(0, 20)
  const rss = generateRSS(posts, 'es')
  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}

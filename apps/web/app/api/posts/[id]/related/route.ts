import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getRelatedPosts } from '@web/lib/db/queries/posts'
import { computeReadingTime } from '@web/utils/computeReadingTime'

const CACHE_HEADERS = {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=3600',
}

const querySchema = z.object({
  lng: z.enum(['en', 'es']),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { lng } = parsed.data
  const { id } = await params

  const posts = await getRelatedPosts(id, lng)
  const data = posts.map(({ status: _s, createdAt: _c, content, ...post }) => ({
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    updatedAt: post.updatedAt.toISOString(),
    readingTime: computeReadingTime(content),
  }))

  return NextResponse.json({ data }, { headers: CACHE_HEADERS })
}

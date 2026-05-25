import { NextResponse } from 'next/server'

import { requireAuth } from '@web/lib/api/parseRequest'
import { getPostsForSeries } from '@web/lib/db/queries/series'
import { logger } from '@web/lib/logger'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { id } = await params

  try {
    const posts = await getPostsForSeries(id)
    logger.debug({ id, count: posts.length }, 'GET /api/series/[id]/posts')
    return NextResponse.json({ data: posts })
  } catch (err) {
    logger.error(err, 'Failed to get posts for series')
    return NextResponse.json(
      { error: 'Failed to get posts for series' },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

import { getPostStatus, incrementPostLikes } from '@web/lib/db/queries/posts'
import { logger } from '@web/lib/logger'
import { likesRatelimit } from '@web/lib/ratelimit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'

  if (likesRatelimit) {
    const { success } = await likesRatelimit.limit(`like:${id}:${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Already liked' }, { status: 429 })
    }
  }

  const status = await getPostStatus(id)
  if (!status || status !== 'published') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const likes = await incrementPostLikes(id)
    return NextResponse.json({ likes })
  } catch (error) {
    logger.error(error, 'Failed to increment likes')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

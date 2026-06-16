import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@web/lib/api/parseRequest'
import { getCommentsAdmin } from '@web/lib/db/queries/comments'
import type { CommentStatus } from '@web/lib/db/schema'
import { logger } from '@web/lib/logger'

const querySchema = z.object({
  postId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
})

export async function GET(request: NextRequest) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { postId, status } = parsed.data

  try {
    const comments = await getCommentsAdmin({
      postId,
      status: status as CommentStatus | undefined,
    })
    return NextResponse.json({ comments })
  } catch (err) {
    logger.error(err, 'GET /api/comments failed')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

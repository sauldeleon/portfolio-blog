import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@web/lib/api/parseRequest'
import {
  deleteComment,
  getCommentById,
  updateCommentStatus,
} from '@web/lib/db/queries/comments'
import type { CommentStatus } from '@web/lib/db/schema'
import { logger } from '@web/lib/logger'

const patchSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  try {
    const comment = await updateCommentStatus(
      id,
      parsed.data.status as CommentStatus,
    )
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }
    return NextResponse.json({ comment })
  } catch (err) {
    logger.error(err, 'PATCH /api/comments/[id] failed')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { id } = await params

  try {
    const existing = await getCommentById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }
    await deleteComment(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error(err, 'DELETE /api/comments/[id] failed')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

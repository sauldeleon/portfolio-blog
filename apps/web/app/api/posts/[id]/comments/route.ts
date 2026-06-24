import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  createComment,
  getApprovedCommentsByPost,
} from '@web/lib/db/queries/comments'
import { getPostMeta } from '@web/lib/db/queries/posts'
import { notifyNewComment } from '@web/lib/email/notifyNewComment'
import { logger } from '@web/lib/logger'
import { ratelimit } from '@web/lib/ratelimit'
import { verifyTurnstile } from '@web/lib/turnstile/verify'

const createCommentSchema = z.object({
  username: z.string().min(1).max(100).trim(),
  body: z.string().min(1).max(2000).trim(),
  turnstileToken: z.string().min(1),
  honeypot: z.string().optional(),
  postTitle: z.string().min(1),
  postNumber: z.number().int().positive(),
  postSlug: z.string().min(1),
  postLng: z.enum(['en', 'es']),
  parentId: z.string().optional().nullable(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const comments = await getApprovedCommentsByPost(id)
    return NextResponse.json({ comments })
  } catch (err) {
    logger.error(err, 'GET /api/posts/[id]/comments failed')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'

  logger.info(
    { postId: id, ip, method: request.method, url: request.url },
    'POST /api/posts/[id]/comments: received',
  )

  if (ratelimit) {
    const { success } = await ratelimit.limit(`comment:${ip}`)
    if (!success) {
      logger.warn({ postId: id, ip }, 'POST comment: rate limited')
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    logger.warn({ postId: id, ip }, 'POST comment: invalid JSON body')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createCommentSchema.safeParse(body)
  if (!parsed.success) {
    logger.warn(
      { postId: id, ip, issues: parsed.error.issues },
      'POST comment: schema validation failed',
    )
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const {
    username,
    body: commentBody,
    turnstileToken,
    honeypot,
    postTitle,
    postNumber,
    postSlug,
    postLng,
    parentId,
  } = parsed.data

  if (honeypot) {
    logger.warn({ postId: id, ip }, 'POST comment: honeypot triggered')
    return NextResponse.json({ ok: true })
  }

  const isValid = await verifyTurnstile(turnstileToken)
  logger.debug(
    { postId: id, ip, turnstileValid: isValid },
    'POST comment: turnstile verified',
  )
  if (!isValid) {
    logger.warn({ postId: id, ip }, 'POST comment: turnstile rejected')
    return NextResponse.json({ error: 'Invalid captcha' }, { status: 422 })
  }

  const meta = await getPostMeta(id)
  logger.debug(
    {
      postId: id,
      status: meta?.status,
      commentsEnabled: meta?.commentsEnabled,
    },
    'POST comment: post meta resolved',
  )
  if (!meta || (meta.status !== 'published' && meta.status !== 'draft')) {
    logger.warn(
      { postId: id, status: meta?.status },
      'POST comment: post not found or not commentable',
    )
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
  if (!meta.commentsEnabled) {
    logger.warn({ postId: id }, 'POST comment: comments disabled for post')
    return NextResponse.json(
      { error: 'Comments are disabled for this post' },
      { status: 403 },
    )
  }

  const sanitizedBody = commentBody
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
  const sanitizedUsername = username.replace(/<[^>]*>/g, '')

  try {
    const comment = await createComment({
      postId: id,
      parentId: parentId ?? null,
      username: sanitizedUsername,
      body: sanitizedBody,
    })

    logger.info(
      { postId: id, ip, commentId: comment.id, parentId: parentId ?? null },
      'POST comment: comment created',
    )

    await notifyNewComment({
      username: sanitizedUsername,
      body: sanitizedBody,
      postTitle,
      postNumber,
      postSlug,
      postLng,
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (err) {
    logger.error(err, 'POST /api/posts/[id]/comments failed')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

import { and, asc, eq, isNull } from 'drizzle-orm'
import { ulid } from 'ulid'

import { db } from '../index'
import { type CommentStatus, comments } from '../schema'

export type CommentRecord = {
  id: string
  postId: string
  parentId: string | null
  username: string
  body: string
  status: CommentStatus
  createdAt: Date
}

function mapRow(row: typeof comments.$inferSelect): CommentRecord {
  return {
    id: row.id,
    postId: row.postId,
    parentId: row.parentId ?? null,
    username: row.username,
    body: row.body,
    status: row.status as CommentStatus,
    createdAt: row.createdAt,
  }
}

export async function getApprovedCommentsByPost(
  postId: string,
): Promise<CommentRecord[]> {
  const rows = await db
    .select()
    .from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.status, 'approved')))
    .orderBy(asc(comments.createdAt))
  return rows.map(mapRow)
}

export async function getCommentsAdmin(opts: {
  postId?: string
  status?: CommentStatus
  parentId?: string | null
}): Promise<CommentRecord[]> {
  const conditions = []
  if (opts.postId) conditions.push(eq(comments.postId, opts.postId))
  if (opts.status) conditions.push(eq(comments.status, opts.status))
  if (opts.parentId === null) conditions.push(isNull(comments.parentId))
  else if (opts.parentId) conditions.push(eq(comments.parentId, opts.parentId))

  const rows = await db
    .select()
    .from(comments)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(comments.createdAt))
  return rows.map(mapRow)
}

export async function getCommentById(
  id: string,
): Promise<CommentRecord | null> {
  const rows = await db.select().from(comments).where(eq(comments.id, id))
  const row = rows[0]
  return row ? mapRow(row) : null
}

export async function createComment(data: {
  postId: string
  parentId?: string | null
  username: string
  body: string
}): Promise<CommentRecord> {
  const [row] = await db
    .insert(comments)
    .values({
      id: ulid(),
      postId: data.postId,
      parentId: data.parentId ?? null,
      username: data.username,
      body: data.body,
      status: 'pending',
    })
    .returning()
  return mapRow(row)
}

export async function updateCommentStatus(
  id: string,
  status: CommentStatus,
): Promise<CommentRecord | null> {
  const rows = await db
    .update(comments)
    .set({ status })
    .where(eq(comments.id, id))
    .returning()
  const row = rows[0]
  return row ? mapRow(row) : null
}

export async function deleteComment(id: string): Promise<boolean> {
  const rows = await db.delete(comments).where(eq(comments.id, id)).returning()
  return rows.length > 0
}

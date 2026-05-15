import { and, eq, isNull, sql } from 'drizzle-orm'

import { db } from '../index'
import { posts } from '../schema'

export async function getAllTags(): Promise<string[]> {
  const rows = await db
    .select({ tag: sql<string>`unnest(${posts.tags})` })
    .from(posts)
    .where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))

  return [...new Set(rows.map((r) => r.tag))].sort()
}

export async function getAllTagsAdmin(): Promise<string[]> {
  const rows = await db
    .select({ tag: sql<string>`unnest(${posts.tags})` })
    .from(posts)
    .where(isNull(posts.deletedAt))

  return [...new Set(rows.map((r) => r.tag))].sort()
}

export type TagWithCount = {
  tag: string
  count: number
}

export async function getPostCountPerTag(): Promise<TagWithCount[]> {
  type Row = { tag: string; count: number }
  const result = await db.execute<Row>(sql`
    SELECT t.tag, count(*)::int AS count
    FROM posts p
    CROSS JOIN LATERAL unnest(p.tags) AS t(tag)
    WHERE p.status = 'published' AND p.deleted_at IS NULL
    GROUP BY t.tag
    ORDER BY count DESC, t.tag ASC
  `)
  return (result as unknown as { rows: Row[] }).rows
}

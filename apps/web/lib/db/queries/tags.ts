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

export type TagWithCount = {
  tag: string
  count: number
}

export async function getPostCountPerTag(): Promise<TagWithCount[]> {
  type Row = { tag: string; count: number }
  const result = await db.execute<Row>(sql`
    SELECT unnest(tags) AS tag, count(*)::int AS count
    FROM posts
    WHERE status = 'published' AND deleted_at IS NULL
    GROUP BY 1
    ORDER BY count DESC, tag ASC
  `)
  return result.rows
}

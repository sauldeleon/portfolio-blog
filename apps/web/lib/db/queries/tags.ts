import { and, eq, isNull, sql } from 'drizzle-orm'

import { db } from '../index'
import { posts } from '../schema'

export async function getAllTags(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ tag: sql<string>`unnest(${posts.tags})` })
    .from(posts)
    .where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))
    .orderBy(sql`1`)

  return rows.map((r) => r.tag)
}

export async function getAllTagsAdmin(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ tag: sql<string>`unnest(${posts.tags})` })
    .from(posts)
    .where(isNull(posts.deletedAt))
    .orderBy(sql`1`)

  return rows.map((r) => r.tag)
}

export type TagWithCount = {
  tag: string
  count: number
}

export async function getPostCountPerTag(
  excludeId?: string,
  filters?: { categories?: string[]; year?: number; month?: number },
): Promise<TagWithCount[]> {
  type Row = { tag: string; count: number }

  let conditions = sql`p.status = 'published' AND p.deleted_at IS NULL`

  if (excludeId != null) {
    conditions = sql`${conditions} AND p.id != ${excludeId}`
  }
  if (filters?.categories?.length) {
    conditions = sql`${conditions} AND p.category = ANY(ARRAY[${sql.join(
      filters.categories.map((c) => sql`${c}`),
      sql`, `,
    )}])`
  }
  if (filters?.year != null) {
    conditions = sql`${conditions} AND date_part('year', p.published_at)::int = ${filters.year}`
  }
  if (filters?.month != null) {
    conditions = sql`${conditions} AND date_part('month', p.published_at)::int = ${filters.month}`
  }

  const result = await db.execute<Row>(sql`
    SELECT t.tag, count(*)::int AS count
    FROM posts p
    CROSS JOIN LATERAL unnest(p.tags) AS t(tag)
    WHERE ${conditions}
    GROUP BY t.tag
    ORDER BY count DESC, t.tag ASC
  `)
  return (result as unknown as { rows: Row[] }).rows
}

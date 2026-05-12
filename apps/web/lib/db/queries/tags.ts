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

import { and, asc, eq, isNull, sql } from 'drizzle-orm'

import { db } from '../index'
import { type NewCategory, categories, posts } from '../schema'

export type CategoryWithCount = {
  slug: string
  name: string
  description: string | null
  postCount: number
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  return db
    .select({
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      postCount: sql<number>`count(${posts.id})::int`,
    })
    .from(categories)
    .leftJoin(
      posts,
      and(eq(posts.category, categories.slug), isNull(posts.deletedAt)),
    )
    .groupBy(categories.slug, categories.name, categories.description)
    .orderBy(asc(categories.name))
}

export async function getCategoryById(
  id: number,
): Promise<typeof categories.$inferSelect | null> {
  const rows = await db.select().from(categories).where(eq(categories.id, id))
  return rows[0] ?? null
}

export async function getCategoryBySlug(
  slug: string,
): Promise<typeof categories.$inferSelect | null> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))

  return rows[0] ?? null
}

export async function createCategory(
  data: NewCategory,
): Promise<typeof categories.$inferSelect> {
  const [cat] = await db.insert(categories).values(data).returning()
  return cat
}

export async function updateCategoryBySlug(
  slug: string,
  data: Pick<NewCategory, 'name' | 'description'>,
): Promise<typeof categories.$inferSelect | null> {
  const [cat] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.slug, slug))
    .returning()

  return cat ?? null
}

export async function updateCategoryById(
  id: number,
  data: Pick<NewCategory, 'name' | 'description'>,
): Promise<typeof categories.$inferSelect | null> {
  const [cat] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning()

  return cat ?? null
}

export async function deleteCategory(slug: string): Promise<void> {
  await db.delete(categories).where(eq(categories.slug, slug))
}

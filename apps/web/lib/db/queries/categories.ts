import { and, asc, eq, isNull, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { db } from '../index'
import {
  type Locale,
  type NewCategoryTranslation,
  categories,
  categoryTranslations,
  posts,
} from '../schema'

export type CategoryTranslation = {
  categorySlug: string
  locale: Locale
  name: string
  description: string | null
  slug: string
}

// Used by blog listing — locale-specific name/description/localeSlug
export type CategoryWithCount = {
  id: number
  slug: string // canonical (immutable FK)
  name: string // locale-specific (EN fallback if no translation)
  description: string | null
  localeSlug: string // locale-specific URL slug
  postCount: number
  publishedPostCount: number
}

// Used by admin — canonical slug + all translations
export type CategoryForAdmin = {
  id: number
  slug: string
  postCount: number
  publishedPostCount: number
  translations: CategoryTranslation[]
}

const tAlias = alias(categoryTranslations, 'ct_locale')
const enAlias = alias(categoryTranslations, 'ct_en')

export async function getCategories(
  locale: Locale = 'en',
): Promise<CategoryWithCount[]> {
  const rows = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: sql<string>`coalesce(${tAlias.name}, ${enAlias.name})`,
      description: sql<
        string | null
      >`coalesce(${tAlias.description}, ${enAlias.description})`,
      localeSlug: sql<string>`coalesce(${tAlias.slug}, ${enAlias.slug}, ${categories.slug})`,
      postCount: sql<number>`count(${posts.id})::int`,
      publishedPostCount: sql<number>`count(case when ${posts.status} = 'published' then 1 end)::int`,
    })
    .from(categories)
    .leftJoin(
      tAlias,
      and(eq(tAlias.categorySlug, categories.slug), eq(tAlias.locale, locale)),
    )
    .leftJoin(
      enAlias,
      and(eq(enAlias.categorySlug, categories.slug), eq(enAlias.locale, 'en')),
    )
    .leftJoin(
      posts,
      and(eq(posts.category, categories.slug), isNull(posts.deletedAt)),
    )
    .groupBy(
      categories.id,
      categories.slug,
      tAlias.name,
      tAlias.description,
      tAlias.slug,
      enAlias.name,
      enAlias.description,
      enAlias.slug,
    )
    .orderBy(sql`coalesce(${tAlias.name}, ${enAlias.name}) asc`)
  return rows
}

export async function getCategoriesForAdmin(): Promise<CategoryForAdmin[]> {
  const [countRows, translationRows] = await Promise.all([
    db
      .select({
        id: categories.id,
        slug: categories.slug,
        postCount: sql<number>`count(${posts.id})::int`,
        publishedPostCount: sql<number>`count(case when ${posts.status} = 'published' then 1 end)::int`,
      })
      .from(categories)
      .leftJoin(
        posts,
        and(eq(posts.category, categories.slug), isNull(posts.deletedAt)),
      )
      .groupBy(categories.id, categories.slug)
      .orderBy(asc(categories.slug)),
    db
      .select()
      .from(categoryTranslations)
      .orderBy(asc(categoryTranslations.categorySlug)),
  ])

  return countRows.map((cat) => ({
    ...cat,
    translations: translationRows
      .filter((t) => t.categorySlug === cat.slug)
      .map((t) => ({
        categorySlug: t.categorySlug,
        locale: t.locale as Locale,
        name: t.name,
        description: t.description,
        slug: t.slug,
      })),
  }))
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

export async function getCategoryByLocaleSlug(
  localeSlug: string,
  locale: Locale,
): Promise<{ canonicalSlug: string } | null> {
  const rows = await db
    .select({ canonicalSlug: categoryTranslations.categorySlug })
    .from(categoryTranslations)
    .where(
      and(
        eq(categoryTranslations.slug, localeSlug),
        eq(categoryTranslations.locale, locale),
      ),
    )
    .limit(1)
  return rows[0] ?? null
}

export async function getCategoryTranslations(
  categorySlug: string,
): Promise<CategoryTranslation[]> {
  const rows = await db
    .select()
    .from(categoryTranslations)
    .where(eq(categoryTranslations.categorySlug, categorySlug))
  return rows.map((r) => ({
    categorySlug: r.categorySlug,
    locale: r.locale as Locale,
    name: r.name,
    description: r.description,
    slug: r.slug,
  }))
}

export async function createCategory(
  canonicalSlug: string,
): Promise<typeof categories.$inferSelect> {
  const [cat] = await db
    .insert(categories)
    .values({ slug: canonicalSlug })
    .returning()
  return cat
}

export async function createCategoryTranslation(
  data: NewCategoryTranslation,
): Promise<CategoryTranslation> {
  const [row] = await db.insert(categoryTranslations).values(data).returning()
  return {
    categorySlug: row.categorySlug,
    locale: row.locale as Locale,
    name: row.name,
    description: row.description,
    slug: row.slug,
  }
}

export async function upsertCategoryTranslation(
  data: NewCategoryTranslation,
): Promise<CategoryTranslation> {
  const [row] = await db
    .insert(categoryTranslations)
    .values(data)
    .onConflictDoUpdate({
      target: [categoryTranslations.categorySlug, categoryTranslations.locale],
      set: {
        name: data.name,
        description: data.description,
        slug: data.slug,
      },
    })
    .returning()
  return {
    categorySlug: row.categorySlug,
    locale: row.locale as Locale,
    name: row.name,
    description: row.description,
    slug: row.slug,
  }
}

export async function deleteCategory(slug: string): Promise<void> {
  await db.delete(categories).where(eq(categories.slug, slug))
}

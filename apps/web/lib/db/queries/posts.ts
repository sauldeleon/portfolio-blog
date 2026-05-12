import {
  and,
  asc,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  ne,
  or,
  sql,
} from 'drizzle-orm'
import { ulid } from 'ulid'

import { db } from '../index'
import {
  type Locale,
  type NewPost,
  type PostStatus,
  postTranslations,
  posts,
} from '../schema'

export type PublicPost = {
  id: string
  category: string
  tags: string[]
  status: PostStatus
  coverImage: string | null
  seriesId: string | null
  seriesOrder: number | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  author: string
  // locale-specific
  title: string
  slug: string
  excerpt: string
}

export type PostWithContent = PublicPost & { content: string }

export type AdminPost = {
  id: string
  category: string
  tags: string[]
  status: PostStatus
  coverImage: string | null
  seriesId: string | null
  seriesOrder: number | null
  scheduledAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  previewToken: string | null
  titleEn: string | null
  slugEn: string | null
  titleEs: string | null
  slugEs: string | null
}

const publicFields = {
  id: posts.id,
  category: posts.category,
  tags: posts.tags,
  status: posts.status,
  coverImage: posts.coverImage,
  seriesId: posts.seriesId,
  seriesOrder: posts.seriesOrder,
  publishedAt: posts.publishedAt,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  author: posts.author,
  title: postTranslations.title,
  slug: postTranslations.slug,
  excerpt: postTranslations.excerpt,
}

const publicFieldsWithContent = {
  ...publicFields,
  content: postTranslations.content,
}

export async function getPublishedPosts(locale: Locale): Promise<PublicPost[]> {
  return db
    .select(publicFields)
    .from(posts)
    .innerJoin(
      postTranslations,
      and(
        eq(postTranslations.postId, posts.id),
        eq(postTranslations.locale, locale),
      ),
    )
    .where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))
    .orderBy(desc(posts.publishedAt))
}

export async function getPostById(
  id: string,
  locale: Locale,
): Promise<PostWithContent | null> {
  const rows = await db
    .select(publicFieldsWithContent)
    .from(posts)
    .innerJoin(
      postTranslations,
      and(
        eq(postTranslations.postId, posts.id),
        eq(postTranslations.locale, locale),
      ),
    )
    .where(and(eq(posts.id, id), isNull(posts.deletedAt)))

  return rows[0] ?? null
}

export async function getPostBySlug(
  locale: Locale,
  slug: string,
): Promise<PostWithContent | null> {
  const rows = await db
    .select(publicFieldsWithContent)
    .from(posts)
    .innerJoin(
      postTranslations,
      and(
        eq(postTranslations.postId, posts.id),
        eq(postTranslations.locale, locale),
      ),
    )
    .where(
      and(
        eq(postTranslations.slug, slug),
        eq(posts.status, 'published'),
        isNull(posts.deletedAt),
      ),
    )

  return rows[0] ?? null
}

export async function getRelatedPosts(
  postId: string,
  locale: Locale,
  limit = 3,
): Promise<PostWithContent[]> {
  const current = await getPostById(postId, locale)
  if (!current) return []

  return db
    .select(publicFieldsWithContent)
    .from(posts)
    .innerJoin(
      postTranslations,
      and(
        eq(postTranslations.postId, posts.id),
        eq(postTranslations.locale, locale),
      ),
    )
    .where(
      and(
        eq(posts.category, current.category),
        ne(posts.id, postId),
        eq(posts.status, 'published'),
        isNull(posts.deletedAt),
      ),
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
}

export type SeriesSummary = {
  seriesId: string
  postCount: number
}

export async function getAllSeries(): Promise<SeriesSummary[]> {
  return db
    .select({
      seriesId: posts.seriesId,
      postCount: sql<number>`count(*)::int`,
    })
    .from(posts)
    .where(
      and(
        isNotNull(posts.seriesId),
        eq(posts.status, 'published'),
        isNull(posts.deletedAt),
      ),
    )
    .groupBy(posts.seriesId)
    .orderBy(asc(posts.seriesId)) as Promise<SeriesSummary[]>
}

export async function getPostsBySeries(
  seriesId: string,
  locale: Locale,
): Promise<PublicPost[]> {
  return db
    .select(publicFields)
    .from(posts)
    .innerJoin(
      postTranslations,
      and(
        eq(postTranslations.postId, posts.id),
        eq(postTranslations.locale, locale),
      ),
    )
    .where(
      and(
        eq(posts.seriesId, seriesId),
        eq(posts.status, 'published'),
        isNull(posts.deletedAt),
      ),
    )
    .orderBy(asc(posts.seriesOrder))
}

export type PostWithTranslations = {
  post: typeof posts.$inferSelect
  translations: Array<typeof postTranslations.$inferSelect>
}

export async function getPostByPreviewToken(
  token: string,
): Promise<PostWithTranslations | null> {
  const postRows = await db
    .select()
    .from(posts)
    .where(eq(posts.previewToken, token))

  if (!postRows[0]) return null

  const translationRows = await db
    .select()
    .from(postTranslations)
    .where(eq(postTranslations.postId, postRows[0].id))

  return { post: postRows[0], translations: translationRows }
}

export async function getAllPosts(): Promise<AdminPost[]> {
  const enT = { ...postTranslations, tableName: 'en_t' }
  const esT = { ...postTranslations, tableName: 'es_t' }

  // Use raw SQL for the admin list with both locales
  type AdminRow = {
    id: string
    category: string
    tags: string[]
    status: PostStatus
    cover_image: string | null
    series_id: string | null
    series_order: number | null
    scheduled_at: Date | null
    published_at: Date | null
    created_at: Date
    updated_at: Date
    preview_token: string | null
    title_en: string | null
    slug_en: string | null
    title_es: string | null
    slug_es: string | null
  }

  const result = await db.execute<AdminRow>(
    sql`
      SELECT
        p.id, p.category, p.tags, p.status,
        p.cover_image, p.series_id, p.series_order,
        p.scheduled_at, p.published_at, p.created_at, p.updated_at,
        p.preview_token,
        en_t.title AS title_en, en_t.slug AS slug_en,
        es_t.title AS title_es, es_t.slug AS slug_es
      FROM posts p
      LEFT JOIN post_translations en_t ON en_t.post_id = p.id AND en_t.locale = 'en'
      LEFT JOIN post_translations es_t ON es_t.post_id = p.id AND es_t.locale = 'es'
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `,
  )

  void enT
  void esT

  return result.rows.map((r) => ({
    id: r.id,
    category: r.category,
    tags: r.tags,
    status: r.status,
    coverImage: r.cover_image,
    seriesId: r.series_id,
    seriesOrder: r.series_order,
    scheduledAt: r.scheduled_at,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    previewToken: r.preview_token,
    titleEn: r.title_en,
    slugEn: r.slug_en,
    titleEs: r.title_es,
    slugEs: r.slug_es,
  }))
}

export type NewPostInput = Omit<NewPost, 'id' | 'createdAt' | 'updatedAt'>
export type TranslationInput = {
  title: string
  slug: string
  excerpt: string
  content: string
}

export async function createPost(
  data: NewPostInput,
  translations: { en: TranslationInput; es?: TranslationInput },
): Promise<typeof posts.$inferSelect> {
  return db.transaction(async (tx) => {
    const id = ulid()
    const [post] = await tx
      .insert(posts)
      .values({ ...data, id })
      .returning()

    const translationRows = (
      Object.entries(translations) as Array<[Locale, TranslationInput]>
    ).map(([locale, t]) => ({ postId: id, locale, ...t }))

    await tx.insert(postTranslations).values(translationRows)
    return post
  })
}

export type PostMetadataUpdate = Partial<
  Omit<NewPost, 'id' | 'createdAt' | 'updatedAt'>
>

export async function updatePost(
  id: string,
  data: PostMetadataUpdate,
): Promise<typeof posts.$inferSelect | null> {
  const [post] = await db
    .update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning()

  return post ?? null
}

export async function updateTranslation(
  postId: string,
  locale: Locale,
  data: Partial<TranslationInput>,
): Promise<typeof postTranslations.$inferSelect | null> {
  const [row] = await db
    .update(postTranslations)
    .set(data)
    .where(
      and(
        eq(postTranslations.postId, postId),
        eq(postTranslations.locale, locale),
      ),
    )
    .returning()

  return row ?? null
}

export async function softDeletePost(id: string): Promise<void> {
  await db
    .update(posts)
    .set({ deletedAt: new Date(), status: 'archived', updatedAt: new Date() })
    .where(eq(posts.id, id))
}

export async function restorePost(id: string): Promise<void> {
  await db
    .update(posts)
    .set({ deletedAt: null, status: 'draft', updatedAt: new Date() })
    .where(eq(posts.id, id))
}

export async function slugExistsForLocale(
  locale: Locale,
  slug: string,
  excludePostId?: string,
): Promise<boolean> {
  const conditions = [
    eq(postTranslations.locale, locale),
    eq(postTranslations.slug, slug),
  ]
  if (excludePostId) {
    conditions.push(ne(postTranslations.postId, excludePostId))
  }
  const rows = await db
    .select({ postId: postTranslations.postId })
    .from(postTranslations)
    .where(and(...conditions))
    .limit(1)
  return rows.length > 0
}

export async function getPostTranslations(
  postId: string,
): Promise<Array<typeof postTranslations.$inferSelect>> {
  return db
    .select()
    .from(postTranslations)
    .where(eq(postTranslations.postId, postId))
}

export type PaginatedPostsParams = {
  locale: Locale
  page: number
  limit: number
  category?: string
  tag?: string
  q?: string
}

export type PaginatedPostsResult = {
  data: PostWithContent[]
  total: number
}

export async function getPublishedPostsPaginated(
  params: PaginatedPostsParams,
): Promise<PaginatedPostsResult> {
  const { locale, page, limit, category, tag, q } = params
  const offset = (page - 1) * limit

  const joinCondition = and(
    eq(postTranslations.postId, posts.id),
    eq(postTranslations.locale, locale),
  )

  const whereConditions = and(
    eq(posts.status, 'published'),
    isNull(posts.deletedAt),
    category ? eq(posts.category, category) : undefined,
    tag ? sql`${posts.tags} @> ARRAY[${tag}]::text[]` : undefined,
    q
      ? or(
          ilike(postTranslations.title, `%${q}%`),
          ilike(postTranslations.excerpt, `%${q}%`),
        )
      : undefined,
  )

  const [data, countRows] = await Promise.all([
    db
      .select(publicFieldsWithContent)
      .from(posts)
      .innerJoin(postTranslations, joinCondition)
      .where(whereConditions)
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .innerJoin(postTranslations, joinCondition)
      .where(whereConditions),
  ])

  return { data, total: countRows[0]?.count ?? 0 }
}

export async function getPublishedPostCountByCategory(
  slug: string,
): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(
      and(
        eq(posts.category, slug),
        eq(posts.status, 'published'),
        isNull(posts.deletedAt),
      ),
    )
  return rows[0]?.count ?? 0
}

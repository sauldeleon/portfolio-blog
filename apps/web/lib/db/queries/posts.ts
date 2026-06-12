import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  ne,
  notInArray,
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
  seriesTranslations,
  users,
} from '../schema'

export type PublicPost = {
  id: string
  postNumber: number
  category: string
  tags: string[]
  status: PostStatus
  coverImage: string | null
  coverImageFit: 'cover' | 'contain' | null
  seriesId: string | null
  seriesOrder: number | null
  seriesTitle: string | null
  likes: number
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
  coverImageFit: 'cover' | 'contain' | null
  seriesId: string | null
  seriesOrder: number | null
  scheduledAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  previewToken: string | null
  titleEn: string | null
  slugEn: string | null
  titleEs: string | null
  slugEs: string | null
}

const publicFields = {
  id: posts.id,
  postNumber: posts.postNumber,
  category: posts.category,
  tags: posts.tags,
  status: posts.status,
  coverImage: posts.coverImage,
  coverImageFit: posts.coverImageFit,
  seriesId: posts.seriesId,
  seriesOrder: posts.seriesOrder,
  seriesTitle: seriesTranslations.title,
  likes: posts.likes,
  publishedAt: posts.publishedAt,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  author: sql<string>`COALESCE(${users.name}, ${users.email}, '')`,
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
    .leftJoin(
      seriesTranslations,
      and(
        eq(seriesTranslations.seriesId, posts.seriesId),
        eq(seriesTranslations.locale, locale),
      ),
    )
    .leftJoin(users, eq(users.id, posts.authorId))
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
    .leftJoin(
      seriesTranslations,
      and(
        eq(seriesTranslations.seriesId, posts.seriesId),
        eq(seriesTranslations.locale, locale),
      ),
    )
    .leftJoin(users, eq(users.id, posts.authorId))
    .where(and(eq(posts.id, id), isNull(posts.deletedAt)))

  return rows[0] ?? null
}

export async function getPostByNumber(
  postNumber: number,
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
    .leftJoin(
      seriesTranslations,
      and(
        eq(seriesTranslations.seriesId, posts.seriesId),
        eq(seriesTranslations.locale, locale),
      ),
    )
    .leftJoin(users, eq(users.id, posts.authorId))
    .where(and(eq(posts.postNumber, postNumber), isNull(posts.deletedAt)))

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
    .leftJoin(
      seriesTranslations,
      and(
        eq(seriesTranslations.seriesId, posts.seriesId),
        eq(seriesTranslations.locale, locale),
      ),
    )
    .leftJoin(users, eq(users.id, posts.authorId))
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

  const categoryTarget = Math.ceil((limit * 2) / 3)

  const translationJoin = and(
    eq(postTranslations.postId, posts.id),
    eq(postTranslations.locale, locale),
  )
  const seriesJoin = and(
    eq(seriesTranslations.seriesId, posts.seriesId),
    eq(seriesTranslations.locale, locale),
  )

  const byCategory = await db
    .select(publicFieldsWithContent)
    .from(posts)
    .innerJoin(postTranslations, translationJoin)
    .leftJoin(seriesTranslations, seriesJoin)
    .leftJoin(users, eq(users.id, posts.authorId))
    .where(
      and(
        eq(posts.category, current.category),
        ne(posts.id, postId),
        eq(posts.status, 'published'),
        isNull(posts.deletedAt),
      ),
    )
    .orderBy(sql`random()`)
    .limit(categoryTarget)

  const tagTarget = limit - byCategory.length
  let byTags: typeof byCategory = []

  if (tagTarget > 0 && current.tags.length > 0) {
    const excludeIds = [postId, ...byCategory.map((p) => p.id)]
    byTags = await db
      .select(publicFieldsWithContent)
      .from(posts)
      .innerJoin(postTranslations, translationJoin)
      .leftJoin(seriesTranslations, seriesJoin)
      .leftJoin(users, eq(users.id, posts.authorId))
      .where(
        and(
          sql`${posts.tags} && ARRAY[${sql.join(
            current.tags.map((t) => sql`${t}`),
            sql`, `,
          )}]`,
          notInArray(posts.id, excludeIds),
          eq(posts.status, 'published'),
          isNull(posts.deletedAt),
        ),
      )
      .orderBy(sql`random()`)
      .limit(tagTarget)
  }

  return [...byCategory, ...byTags]
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

export async function getAllSeriesAdmin(): Promise<string[]> {
  const rows = await db
    .select({ seriesId: posts.seriesId })
    .from(posts)
    .where(and(isNotNull(posts.seriesId), isNull(posts.deletedAt)))
    .groupBy(posts.seriesId)
    .orderBy(asc(posts.seriesId))

  return rows.map((r) => r.seriesId as string)
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
    .leftJoin(
      seriesTranslations,
      and(
        eq(seriesTranslations.seriesId, posts.seriesId),
        eq(seriesTranslations.locale, locale),
      ),
    )
    .leftJoin(users, eq(users.id, posts.authorId))
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
  authorName: string
}

export async function getPostByPreviewToken(
  token: string,
): Promise<PostWithTranslations | null> {
  const postRows = await db
    .select()
    .from(posts)
    .where(eq(posts.previewToken, token))

  if (!postRows[0]) return null

  const [translationRows, authorRows] = await Promise.all([
    db
      .select()
      .from(postTranslations)
      .where(eq(postTranslations.postId, postRows[0].id)),
    postRows[0].authorId
      ? db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, postRows[0].authorId))
      : Promise.resolve([]),
  ])

  const authorName = authorRows[0]?.name ?? ''

  return { post: postRows[0], translations: translationRows, authorName }
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
    cover_image_fit: 'cover' | 'contain' | null
    series_id: string | null
    series_order: number | null
    scheduled_at: Date | null
    published_at: Date | null
    created_at: Date
    updated_at: Date
    deleted_at: Date | null
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
        p.cover_image, p.cover_image_fit, p.series_id, p.series_order,
        p.scheduled_at, p.published_at, p.created_at, p.updated_at, p.deleted_at,
        p.preview_token,
        en_t.title AS title_en, en_t.slug AS slug_en,
        es_t.title AS title_es, es_t.slug AS slug_es
      FROM posts p
      LEFT JOIN post_translations en_t ON en_t.post_id = p.id AND en_t.locale = 'en'
      LEFT JOIN post_translations es_t ON es_t.post_id = p.id AND es_t.locale = 'es'
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
    coverImageFit: r.cover_image_fit,
    seriesId: r.series_id,
    seriesOrder: r.series_order,
    scheduledAt: r.scheduled_at,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
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
  translations: { en?: TranslationInput; es?: TranslationInput },
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

export async function upsertTranslation(
  postId: string,
  locale: Locale,
  data: TranslationInput,
): Promise<typeof postTranslations.$inferSelect> {
  const [row] = await db
    .insert(postTranslations)
    .values({ postId, locale, ...data })
    .onConflictDoUpdate({
      target: [postTranslations.postId, postTranslations.locale],
      set: data,
    })
    .returning()

  return row
}

export async function getPostStatus(id: string): Promise<PostStatus | null> {
  const [row] = await db
    .select({ status: posts.status })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)
  return row?.status ?? null
}

export async function softDeletePost(id: string): Promise<void> {
  await db
    .update(posts)
    .set({ status: 'archived', deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(posts.id, id))
}

export async function hardDeletePost(id: string): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id))
}

export async function restorePost(id: string): Promise<void> {
  await db
    .update(posts)
    .set({ status: 'draft', deletedAt: null, updatedAt: new Date() })
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

export async function getPostForEdit(
  id: string,
): Promise<PostWithTranslations | null> {
  const postRows = await db.select().from(posts).where(eq(posts.id, id))

  if (!postRows[0]) return null

  const translationRows = await getPostTranslations(id)
  return { post: postRows[0], translations: translationRows, authorName: '' }
}

export type PaginatedPostsParams = {
  locale: Locale
  page: number
  limit: number
  categories?: string[]
  tags?: string[]
  q?: string
  year?: number
  month?: number
  excludeId?: string
}

export type PaginatedPostsResult = {
  data: PostWithContent[]
  total: number
}

export async function getPublishedPostsPaginated(
  params: PaginatedPostsParams,
): Promise<PaginatedPostsResult> {
  const { locale, page, limit, categories, tags, q, year, month, excludeId } =
    params
  const offset = (page - 1) * limit

  const joinCondition = and(
    eq(postTranslations.postId, posts.id),
    eq(postTranslations.locale, locale),
  )

  const whereConditions = and(
    eq(posts.status, 'published'),
    isNull(posts.deletedAt),
    categories?.length ? inArray(posts.category, categories) : undefined,
    tags?.length
      ? and(...tags.map((tag) => sql`${posts.tags} @> ARRAY[${tag}]::text[]`))
      : undefined,
    q
      ? or(
          ilike(postTranslations.title, `%${q}%`),
          ilike(postTranslations.excerpt, `%${q}%`),
        )
      : undefined,
    year ? sql`date_part('year', ${posts.publishedAt}) = ${year}` : undefined,
    month
      ? sql`date_part('month', ${posts.publishedAt}) = ${month}`
      : undefined,
    excludeId ? ne(posts.id, excludeId) : undefined,
  )

  const seriesJoinCondition = and(
    eq(seriesTranslations.seriesId, posts.seriesId),
    eq(seriesTranslations.locale, locale),
  )

  const [data, countRows] = await Promise.all([
    db
      .select(publicFieldsWithContent)
      .from(posts)
      .innerJoin(postTranslations, joinCondition)
      .leftJoin(seriesTranslations, seriesJoinCondition)
      .leftJoin(users, eq(users.id, posts.authorId))
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

export type PublishedDateGroup = {
  year: number
  count: number
  months: { month: number; count: number }[]
}

export async function getPostPublishedDates(
  locale: Locale,
  excludeId?: string,
  filters?: { categories?: string[]; tags?: string[] },
): Promise<PublishedDateGroup[]> {
  type Row = {
    year: number
    count: number
    months: { month: number; count: number }[]
  }

  let conditions = sql`p.status = 'published' AND p.deleted_at IS NULL AND p.published_at IS NOT NULL`

  if (excludeId != null) {
    conditions = sql`${conditions} AND p.id != ${excludeId}`
  }
  if (filters?.categories?.length) {
    conditions = sql`${conditions} AND p.category = ANY(ARRAY[${sql.join(
      filters.categories.map((c) => sql`${c}`),
      sql`, `,
    )}])`
  }
  for (const tag of filters?.tags ?? []) {
    conditions = sql`${conditions} AND p.tags @> ARRAY[${tag}]::text[]`
  }

  const result = await db.execute<Row>(sql`
    SELECT
      year,
      SUM(month_count)::int AS count,
      json_agg(json_build_object('month', month, 'count', month_count) ORDER BY month) AS months
    FROM (
      SELECT
        date_part('year', p.published_at)::int AS year,
        date_part('month', p.published_at)::int AS month,
        COUNT(*)::int AS month_count
      FROM posts p
      INNER JOIN post_translations pt ON pt.post_id = p.id AND pt.locale = ${locale}
      WHERE ${conditions}
      GROUP BY year, month
    ) sub
    GROUP BY year
    ORDER BY year DESC
  `)
  return result.rows
}

export async function getLatestPublishedPost(
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
    .leftJoin(
      seriesTranslations,
      and(
        eq(seriesTranslations.seriesId, posts.seriesId),
        eq(seriesTranslations.locale, locale),
      ),
    )
    .leftJoin(users, eq(users.id, posts.authorId))
    .where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))
    .orderBy(desc(posts.publishedAt))
    .limit(1)
  return rows[0] ?? null
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

export type ScheduledPost = {
  id: string
  scheduledAt: Date
}

export async function incrementPostLikes(postId: string): Promise<number> {
  const rows = await db
    .update(posts)
    .set({ likes: sql`${posts.likes} + 1` })
    .where(eq(posts.id, postId))
    .returning({ likes: posts.likes })
  return rows[0]?.likes ?? 0
}

export async function getScheduledPostsToPublish(): Promise<ScheduledPost[]> {
  type Row = { id: string; scheduled_at: Date }
  const result = await db.execute<Row>(sql`
    SELECT p.id, p.scheduled_at
    FROM posts p
    INNER JOIN post_translations en_t
      ON en_t.post_id = p.id AND en_t.locale = 'en' AND en_t.content != ''
    INNER JOIN post_translations es_t
      ON es_t.post_id = p.id AND es_t.locale = 'es' AND es_t.content != ''
    WHERE p.status = 'draft'
      AND p.deleted_at IS NULL
      AND p.scheduled_at IS NOT NULL
      AND p.scheduled_at <= NOW()
  `)
  return result.rows.map((r) => ({ id: r.id, scheduledAt: r.scheduled_at }))
}

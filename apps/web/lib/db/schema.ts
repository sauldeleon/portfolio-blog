import {
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
})

export const categoryTranslations = pgTable(
  'category_translations',
  {
    categorySlug: text('category_slug')
      .notNull()
      .references(() => categories.slug, { onDelete: 'cascade' }),
    locale: text('locale', { enum: ['en', 'es'] }).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    slug: text('slug').notNull(), // locale-specific URL slug
  },
  (t) => [
    primaryKey({ columns: [t.categorySlug, t.locale] }),
    unique().on(t.locale, t.slug),
  ],
)

export const series = pgTable('series', {
  id: text('id').primaryKey(),
})

export const seriesTranslations = pgTable(
  'series_translations',
  {
    seriesId: text('series_id')
      .notNull()
      .references(() => series.id, { onDelete: 'cascade' }),
    locale: text('locale', { enum: ['en', 'es'] }).notNull(),
    title: text('title').notNull(),
  },
  (t) => [primaryKey({ columns: [t.seriesId, t.locale] })],
)

export const posts = pgTable(
  'posts',
  {
    id: text('id').primaryKey(), // ULID
    category: text('category')
      .notNull()
      .references(() => categories.slug),
    tags: text('tags').array().notNull().default([]),
    author: text('author').notNull(),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    coverImage: text('cover_image'),
    coverImageFit: text('cover_image_fit', { enum: ['cover', 'contain'] }),
    seriesId: text('series_id'),
    seriesOrder: integer('series_order'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }), // soft delete
    previewToken: text('preview_token').unique(),
  },
  (t) => [index('posts_tags_gin_idx').using('gin', t.tags)],
)

export const postTranslations = pgTable(
  'post_translations',
  {
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    locale: text('locale', { enum: ['en', 'es'] }).notNull(),
    title: text('title').notNull(),
    slug: text('slug').notNull(), // locale-specific slug
    excerpt: text('excerpt').notNull(),
    content: text('content').notNull(), // MDX string
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.locale] }),
    unique().on(t.locale, t.slug), // slug unique per locale
  ],
)

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type CategoryTranslation = typeof categoryTranslations.$inferSelect
export type NewCategoryTranslation = typeof categoryTranslations.$inferInsert
export type Series = typeof series.$inferSelect
export type NewSeries = typeof series.$inferInsert
export type SeriesTranslation = typeof seriesTranslations.$inferSelect
export type NewSeriesTranslation = typeof seriesTranslations.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type PostTranslation = typeof postTranslations.$inferSelect
export type NewPostTranslation = typeof postTranslations.$inferInsert
export type Locale = 'en' | 'es'
export type PostStatus = 'draft' | 'published' | 'archived'
export type CoverImageFit = 'cover' | 'contain'

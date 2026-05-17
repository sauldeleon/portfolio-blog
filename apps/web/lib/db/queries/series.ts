import { and, eq, isNotNull, ne, sql } from 'drizzle-orm'

import { db } from '../index'
import { type Locale, posts, series, seriesTranslations } from '../schema'

export type SeriesWithTranslations = {
  id: string
  nextOrder: number
  translations: Array<{ locale: string; title: string }>
}

export async function getAllSeriesWithTranslations(): Promise<
  SeriesWithTranslations[]
> {
  const [rows, maxOrderRows] = await Promise.all([
    db
      .select({
        id: series.id,
        locale: seriesTranslations.locale,
        title: seriesTranslations.title,
      })
      .from(series)
      .leftJoin(seriesTranslations, eq(seriesTranslations.seriesId, series.id))
      .orderBy(series.id),
    db
      .select({
        seriesId: posts.seriesId,
        maxOrder: sql<number>`coalesce(max(${posts.seriesOrder}), 0)`,
      })
      .from(posts)
      .where(isNotNull(posts.seriesId))
      .groupBy(posts.seriesId),
  ])

  const nextOrderMap = new Map<string, number>(
    maxOrderRows.map((r) => [r.seriesId!, r.maxOrder + 1]),
  )

  const map = new Map<string, SeriesWithTranslations>()
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        nextOrder: nextOrderMap.get(row.id) ?? 1,
        translations: [],
      })
    }
    if (row.locale && row.title) {
      map
        .get(row.id)!
        .translations.push({ locale: row.locale, title: row.title })
    }
  }
  return Array.from(map.values())
}

export async function seriesOrderExistsForSeries(
  seriesId: string,
  order: number,
  excludePostId?: string,
): Promise<boolean> {
  const conditions = [
    eq(posts.seriesId, seriesId),
    eq(posts.seriesOrder, order),
    ...(excludePostId ? [ne(posts.id, excludePostId)] : []),
  ]
  const rows = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(...conditions))
    .limit(1)
  return rows.length > 0
}

export async function ensureSeries(seriesId: string): Promise<void> {
  await db.insert(series).values({ id: seriesId }).onConflictDoNothing()
}

export async function upsertSeriesTranslation(
  seriesId: string,
  locale: Locale,
  title: string,
): Promise<void> {
  await db.insert(series).values({ id: seriesId }).onConflictDoNothing()
  await db
    .insert(seriesTranslations)
    .values({ seriesId, locale, title })
    .onConflictDoUpdate({
      target: [seriesTranslations.seriesId, seriesTranslations.locale],
      set: { title },
    })
}

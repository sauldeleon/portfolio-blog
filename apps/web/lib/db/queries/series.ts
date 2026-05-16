import { eq } from 'drizzle-orm'

import { db } from '../index'
import { type Locale, series, seriesTranslations } from '../schema'

export type SeriesWithTranslations = {
  id: string
  translations: Array<{ locale: string; title: string }>
}

export async function getAllSeriesWithTranslations(): Promise<
  SeriesWithTranslations[]
> {
  const rows = await db
    .select({
      id: series.id,
      locale: seriesTranslations.locale,
      title: seriesTranslations.title,
    })
    .from(series)
    .leftJoin(seriesTranslations, eq(seriesTranslations.seriesId, series.id))
    .orderBy(series.id)

  const map = new Map<string, SeriesWithTranslations>()
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, { id: row.id, translations: [] })
    }
    if (row.locale && row.title) {
      map
        .get(row.id)!
        .translations.push({ locale: row.locale, title: row.title })
    }
  }
  return Array.from(map.values())
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

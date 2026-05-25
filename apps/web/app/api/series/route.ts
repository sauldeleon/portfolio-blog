import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { parseAuthRequest, requireAuth } from '@web/lib/api/parseRequest'
import { db } from '@web/lib/db'
import {
  getSeriesForAdmin,
  upsertSeriesTranslation,
} from '@web/lib/db/queries/series'
import { series } from '@web/lib/db/schema'
import { logger } from '@web/lib/logger'

export async function GET() {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  try {
    const data = await getSeriesForAdmin()
    logger.debug({ count: data.length }, 'GET /api/series')
    return NextResponse.json({ data })
  } catch (err) {
    logger.error(err, 'Failed to get series')
    return NextResponse.json({ error: 'Failed to get series' }, { status: 500 })
  }
}

const createSeriesSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(
      /^[\p{L}\p{N}_-]+$/u,
      'ID must be letters, numbers, hyphens, or underscores',
    ),
  translations: z
    .object({
      en: z.string().optional(),
      es: z.string().optional(),
    })
    .optional(),
})

export async function POST(request: Request) {
  const result = await parseAuthRequest(request, createSeriesSchema)
  if (!result.ok) return result.response

  const { id, translations } = result.data
  logger.debug({ id }, 'POST /api/series')

  try {
    const existing = await db
      .select({ id: series.id })
      .from(series)
      .where(eq(series.id, id))
      .limit(1)
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Series '${id}' already exists` },
        { status: 409 },
      )
    }

    await db.insert(series).values({ id })

    if (translations?.en) {
      await upsertSeriesTranslation(id, 'en', translations.en)
    }
    if (translations?.es) {
      await upsertSeriesTranslation(id, 'es', translations.es)
    }

    logger.info({ id }, 'POST /api/series: created')
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    logger.error(err, 'Failed to create series')
    return NextResponse.json(
      { error: 'Failed to create series' },
      { status: 500 },
    )
  }
}

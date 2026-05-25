import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { parseAuthRequest, requireAuth } from '@web/lib/api/parseRequest'
import { db } from '@web/lib/db'
import { upsertSeriesTranslation } from '@web/lib/db/queries/series'
import { posts, series, seriesTranslations } from '@web/lib/db/schema'
import { logger } from '@web/lib/logger'

const updateSchema = z.object({
  locale: z.enum(['en', 'es']),
  title: z.string().min(1),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await parseAuthRequest(request, updateSchema)
  if (!result.ok) return result.response

  const { id } = await params
  const { locale, title } = result.data
  logger.debug({ id, locale }, 'PUT /api/series/[id]')

  try {
    await upsertSeriesTranslation(id, locale, title)
    logger.info({ id, locale }, 'PUT /api/series/[id]: updated')
    return NextResponse.json({ id, locale, title })
  } catch (err) {
    logger.error(err, 'Failed to update series')
    return NextResponse.json(
      { error: 'Failed to update series' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { id } = await params
  logger.debug({ id }, 'DELETE /api/series/[id]')

  try {
    const linked = await db
      .select({ id: posts.id })
      .from(posts)
      .where(
        and(
          eq(posts.seriesId, id),
          isNotNull(posts.seriesId),
          isNull(posts.deletedAt),
        ),
      )
      .limit(1)

    if (linked.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete series with posts' },
        { status: 422 },
      )
    }

    await db
      .delete(seriesTranslations)
      .where(eq(seriesTranslations.seriesId, id))
    await db.delete(series).where(eq(series.id, id))

    logger.info({ id }, 'DELETE /api/series/[id]: deleted')
    return NextResponse.json({ id })
  } catch (err) {
    logger.error(err, 'Failed to delete series')
    return NextResponse.json(
      { error: 'Failed to delete series' },
      { status: 500 },
    )
  }
}

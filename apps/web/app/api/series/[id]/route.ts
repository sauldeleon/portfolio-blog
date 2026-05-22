import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@web/lib/auth/config'
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
  const session = await auth()
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { locale, title } = parsed.data

  try {
    await upsertSeriesTranslation(id, locale, title)
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
  const session = await auth()
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

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

    return NextResponse.json({ id })
  } catch (err) {
    logger.error(err, 'Failed to delete series')
    return NextResponse.json(
      { error: 'Failed to delete series' },
      { status: 500 },
    )
  }
}

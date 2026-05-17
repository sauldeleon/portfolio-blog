import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@web/lib/auth/config'
import { db } from '@web/lib/db'
import {
  getSeriesForAdmin,
  upsertSeriesTranslation,
} from '@web/lib/db/queries/series'
import { series } from '@web/lib/db/schema'

export async function GET() {
  const session = await auth()
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await getSeriesForAdmin()
  return NextResponse.json({ data })
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
  const session = await auth()
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createSeriesSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { id, translations } = parsed.data

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

  return NextResponse.json({ id }, { status: 201 })
}

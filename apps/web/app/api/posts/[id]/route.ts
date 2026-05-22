import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@web/lib/auth/config'
import { getCategoryBySlug } from '@web/lib/db/queries/categories'
import {
  getPostById,
  getPostStatus,
  getPostTranslations,
  hardDeletePost,
  slugExistsForLocale,
  softDeletePost,
  updatePost,
  upsertTranslation,
} from '@web/lib/db/queries/posts'
import {
  ensureSeries,
  seriesOrderExistsForSeries,
  upsertSeriesTranslation,
} from '@web/lib/db/queries/series'
import { logger } from '@web/lib/logger'
import { computeReadingTime } from '@web/utils/computeReadingTime'

const CACHE_HEADERS = {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=3600',
}

const getPostQuerySchema = z.object({
  lng: z.enum(['en', 'es']),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { searchParams } = new URL(request.url)
  const parsed = getPostQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { lng } = parsed.data
  const { id } = await params

  try {
    const post = await getPostById(id, lng)
    if (!post || post.status !== 'published') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const { status: _s, createdAt: _c, ...rest } = post
    return NextResponse.json(
      {
        ...rest,
        publishedAt: rest.publishedAt?.toISOString() ?? null,
        updatedAt: rest.updatedAt.toISOString(),
        readingTime: computeReadingTime(rest.content),
      },
      { headers: CACHE_HEADERS },
    )
  } catch (err) {
    logger.error(err, 'Failed to get post')
    return NextResponse.json({ error: 'Failed to get post' }, { status: 500 })
  }
}

const translationUpdateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
})

const updatePostSchema = z.object({
  category: z.string().min(1).optional(),
  authorId: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  coverImage: z.string().nullable().optional(),
  coverImageFit: z.enum(['cover', 'contain']).nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  seriesId: z.string().nullable().optional(),
  seriesOrder: z.number().int().nullable().optional(),
  seriesTitles: z
    .object({ en: z.string().optional(), es: z.string().optional() })
    .optional(),
  translations: z
    .object({
      en: translationUpdateSchema.optional(),
      es: translationUpdateSchema.optional(),
    })
    .optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updatePostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const data = parsed.data

  if (data.category !== undefined) {
    const category = await getCategoryBySlug(data.category)
    if (!category) {
      return NextResponse.json({ error: 'Unknown category' }, { status: 422 })
    }
  }

  if (data.translations) {
    for (const [locale, t] of Object.entries(data.translations) as Array<
      ['en' | 'es', { slug?: string } | undefined]
    >) {
      if (t?.slug && (await slugExistsForLocale(locale, t.slug, id))) {
        return NextResponse.json(
          { error: `Slug '${t.slug}' already taken for locale '${locale}'` },
          { status: 409 },
        )
      }
    }
  }

  if (data.status === 'published') {
    const existing = await getPostTranslations(id)
    const existingLocales = new Set(existing.map((t) => t.locale))
    const updatedLocales = new Set([
      ...existingLocales,
      ...Object.keys(data.translations ?? {}),
    ])
    if (!updatedLocales.has('en') || !updatedLocales.has('es')) {
      return NextResponse.json(
        { error: 'Both translations required for published status' },
        { status: 422 },
      )
    }
  }

  const { translations, scheduledAt, ...postData } = data

  const publishedAtUpdate =
    data.status === 'published'
      ? { publishedAt: new Date() }
      : data.status === 'draft' || data.status === 'archived'
        ? { publishedAt: null }
        : {}

  const deletedAtUpdate =
    data.status === 'archived'
      ? { deletedAt: new Date() }
      : data.status === 'draft'
        ? { deletedAt: null }
        : {}

  try {
    if (data.seriesId) {
      await ensureSeries(data.seriesId)
    }

    if (data.seriesId && data.seriesOrder != null) {
      const orderTaken = await seriesOrderExistsForSeries(
        data.seriesId,
        data.seriesOrder,
        id,
      )
      if (orderTaken) {
        return NextResponse.json(
          {
            error: `Order ${data.seriesOrder} is already taken in this series`,
          },
          { status: 422 },
        )
      }
    }

    const post = await updatePost(id, {
      ...postData,
      ...(postData.tags !== undefined
        ? { tags: postData.tags.map((t) => t.toUpperCase()) }
        : {}),
      ...publishedAtUpdate,
      ...deletedAtUpdate,
      ...(scheduledAt !== undefined
        ? { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }
        : {}),
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (translations) {
      for (const [locale, t] of Object.entries(translations) as Array<
        ['en' | 'es', z.infer<typeof translationUpdateSchema>]
      >) {
        await upsertTranslation(id, locale, t)
      }
    }

    const resolvedSeriesId =
      data.seriesId !== undefined ? data.seriesId : post.seriesId
    if (resolvedSeriesId && data.seriesTitles) {
      for (const [locale, title] of Object.entries(data.seriesTitles) as Array<
        ['en' | 'es', string | undefined]
      >) {
        /* istanbul ignore next */
        if (title) {
          await upsertSeriesTranslation(resolvedSeriesId, locale, title)
        }
      }
    }

    revalidateTag('posts', 'default')
    revalidateTag(`post-${id}`, 'default')
    return NextResponse.json(post)
  } catch (err) {
    logger.error(err, 'Failed to update post')
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const hard = searchParams.get('hard') === 'true'

  try {
    const status = await getPostStatus(id)

    if (hard) {
      if (status !== 'archived') {
        return NextResponse.json(
          { error: 'Only archived posts can be permanently deleted.' },
          { status: 422 },
        )
      }
      await hardDeletePost(id)
      revalidateTag('posts', 'default')
      revalidateTag(`post-${id}`, 'default')
      return new NextResponse(null, { status: 204 })
    }

    if (status === 'published') {
      return NextResponse.json(
        { error: 'Cannot archive a published post. Unpublish it first.' },
        { status: 422 },
      )
    }

    await softDeletePost(id)
    revalidateTag('posts', 'default')
    revalidateTag(`post-${id}`, 'default')
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    logger.error(err, 'Failed to delete post')
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 },
    )
  }
}

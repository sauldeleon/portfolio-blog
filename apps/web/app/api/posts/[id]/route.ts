import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '../../../../lib/auth/config'
import { getCategoryBySlug } from '../../../../lib/db/queries/categories'
import {
  getPostTranslations,
  slugExistsForLocale,
  softDeletePost,
  updatePost,
  updateTranslation,
} from '../../../../lib/db/queries/posts'

const translationUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
})

const updatePostSchema = z.object({
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  coverImage: z.string().optional(),
  scheduledAt: z.string().optional(),
  seriesId: z.string().optional(),
  seriesOrder: z.number().int().optional(),
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
  const post = await updatePost(id, {
    ...postData,
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
      await updateTranslation(id, locale, t)
    }
  }

  return NextResponse.json(post)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await softDeletePost(id)
  return new NextResponse(null, { status: 204 })
}

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@web/lib/auth/config'
import {
  deleteCategory,
  getCategoryBySlug,
  upsertCategoryTranslation,
} from '@web/lib/db/queries/categories'
import { getPublishedPostCountByCategory } from '@web/lib/db/queries/posts'

const updateTranslationSchema = z.object({
  locale: z.enum(['en', 'es']),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  slug: z
    .string()
    .regex(/^[\p{L}\p{N}-]+$/u, 'Slug must be lowercase with hyphens')
    .optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateTranslationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const existing = await getCategoryBySlug(slug)
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  const { locale, name, description, slug: localeSlug } = parsed.data

  const translation = await upsertCategoryTranslation({
    categorySlug: slug,
    locale,
    name: name ?? slug,
    description: description !== undefined ? description : null,
    slug: localeSlug ?? slug,
  })

  return NextResponse.json(translation)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  const publishedCount = await getPublishedPostCountByCategory(slug)
  if (publishedCount > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${publishedCount} published post(s) reference this category`,
      },
      { status: 409 },
    )
  }

  await deleteCategory(slug)
  return new NextResponse(null, { status: 204 })
}

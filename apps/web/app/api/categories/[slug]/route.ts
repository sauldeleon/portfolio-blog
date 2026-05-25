import { NextResponse } from 'next/server'
import { z } from 'zod'

import { parseAuthRequest, requireAuth } from '@web/lib/api/parseRequest'
import {
  deleteCategory,
  getCategoryBySlug,
  upsertCategoryTranslation,
} from '@web/lib/db/queries/categories'
import { getPublishedPostCountByCategory } from '@web/lib/db/queries/posts'
import { logger } from '@web/lib/logger'

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
  const result = await parseAuthRequest(request, updateTranslationSchema)
  if (!result.ok) return result.response

  const { slug } = await params
  logger.debug(
    { slug, locale: result.data.locale },
    'PUT /api/categories/[slug]',
  )

  try {
    const existing = await getCategoryBySlug(slug)
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const { locale, name, description, slug: localeSlug } = result.data

    const translation = await upsertCategoryTranslation({
      categorySlug: slug,
      locale,
      name: name ?? slug,
      description: description !== undefined ? description : null,
      slug: localeSlug ?? slug,
    })

    logger.info({ slug, locale }, 'PUT /api/categories/[slug]: updated')
    return NextResponse.json(translation)
  } catch (err) {
    logger.error(err, 'Failed to update category')
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { slug } = await params
  logger.debug({ slug }, 'DELETE /api/categories/[slug]')

  try {
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
    logger.info({ slug }, 'DELETE /api/categories/[slug]: deleted')
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    logger.error(err, 'Failed to delete category')
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { parseAuthRequest, requireAuth } from '@web/lib/api/parseRequest'
import {
  createCategory,
  createCategoryTranslation,
  getCategories,
  getCategoriesForAdmin,
  getCategoryBySlug,
} from '@web/lib/db/queries/categories'
import { logger } from '@web/lib/logger'

const CACHE_HEADERS = {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=3600',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  if (searchParams.get('admin') === '1') {
    const authResult = await requireAuth()
    if (!authResult.ok) return authResult.response
    try {
      const categories = await getCategoriesForAdmin()
      logger.debug({ count: categories.length }, 'GET /api/categories admin')
      return NextResponse.json({ data: categories })
    } catch (err) {
      logger.error(err, 'Failed to get categories')
      return NextResponse.json(
        { error: 'Failed to get categories' },
        { status: 500 },
      )
    }
  }

  try {
    const categories = await getCategories()
    logger.debug({ count: categories.length }, 'GET /api/categories')
    return NextResponse.json({ data: categories }, { headers: CACHE_HEADERS })
  } catch (err) {
    logger.error(err, 'Failed to get categories')
    return NextResponse.json(
      { error: 'Failed to get categories' },
      { status: 500 },
    )
  }
}

const translationSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .regex(/^[\p{L}\p{N}-]+$/u, 'Slug must be lowercase with hyphens'),
  description: z.string().optional(),
})

const createCategorySchema = z.object({
  translations: z.object({
    en: translationSchema,
    es: translationSchema.optional(),
  }),
})

export async function POST(request: Request) {
  const result = await parseAuthRequest(request, createCategorySchema)
  if (!result.ok) return result.response

  const { translations } = result.data
  const canonicalSlug = translations.en.slug

  logger.debug({ slug: canonicalSlug }, 'POST /api/categories')

  try {
    const existing = await getCategoryBySlug(canonicalSlug)
    if (existing) {
      return NextResponse.json(
        { error: `Category slug '${canonicalSlug}' already exists` },
        { status: 409 },
      )
    }

    const category = await createCategory(canonicalSlug)

    await createCategoryTranslation({
      categorySlug: canonicalSlug,
      locale: 'en',
      name: translations.en.name,
      description: translations.en.description ?? null,
      slug: translations.en.slug,
    })

    if (translations.es) {
      await createCategoryTranslation({
        categorySlug: canonicalSlug,
        locale: 'es',
        name: translations.es.name,
        description: translations.es.description ?? null,
        slug: translations.es.slug,
      })
    }

    logger.info({ slug: canonicalSlug }, 'POST /api/categories: created')
    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    logger.error(err, 'Failed to create category')
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 },
    )
  }
}

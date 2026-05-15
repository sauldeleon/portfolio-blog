import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@web/lib/auth/config'
import {
  createCategory,
  createCategoryTranslation,
  getCategories,
  getCategoriesForAdmin,
  getCategoryBySlug,
} from '@web/lib/db/queries/categories'

const CACHE_HEADERS = {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=3600',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  if (searchParams.get('admin') === '1') {
    const session = await auth()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const categories = await getCategoriesForAdmin()
    return NextResponse.json({ data: categories })
  }

  const categories = await getCategories()
  return NextResponse.json({ data: categories }, { headers: CACHE_HEADERS })
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
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createCategorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { translations } = parsed.data
  const canonicalSlug = translations.en.slug

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

  return NextResponse.json(category, { status: 201 })
}

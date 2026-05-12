import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@web/lib/auth/config'
import {
  createCategory,
  getCategories,
  getCategoryBySlug,
} from '@web/lib/db/queries/categories'

const CACHE_HEADERS = {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=3600',
}

export async function GET() {
  const categories = await getCategories()
  return NextResponse.json({ data: categories }, { headers: CACHE_HEADERS })
}

const createCategorySchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1),
  description: z.string().optional(),
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

  const data = parsed.data

  const existing = await getCategoryBySlug(data.slug)
  if (existing) {
    return NextResponse.json(
      { error: `Category slug '${data.slug}' already exists` },
      { status: 409 },
    )
  }

  const category = await createCategory({
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
  })

  return NextResponse.json(category, { status: 201 })
}

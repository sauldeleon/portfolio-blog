import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@web/lib/auth/config'
import {
  deleteCategory,
  getCategoryBySlug,
  updateCategoryBySlug,
} from '@web/lib/db/queries/categories'
import { getPublishedPostCountByCategory } from '@web/lib/db/queries/posts'

const updateCategorySchema = z.object({
  slug: z
    .never({ message: 'Slug is immutable and cannot be changed' })
    .optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
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

  const parsed = updateCategorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const existing = await getCategoryBySlug(slug)
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  const data = parsed.data
  const category = await updateCategoryBySlug(slug, {
    name: data.name ?? existing.name,
    description:
      data.description !== undefined ? data.description : existing.description,
  })

  return NextResponse.json(category)
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

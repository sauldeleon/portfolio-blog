import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@web/lib/auth/config'
import { getCategoryBySlug } from '@web/lib/db/queries/categories'
import {
  createPost,
  getPublishedPostsPaginated,
  slugExistsForLocale,
} from '@web/lib/db/queries/posts'
import { computeReadingTime } from '@web/utils/readingTime'

const CACHE_HEADERS = {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=3600',
}

const getPostsQuerySchema = z.object({
  lng: z.enum(['en', 'es']),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = getPostsQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { lng, page, limit, category, tag, q } = parsed.data
  const { data, total } = await getPublishedPostsPaginated({
    locale: lng,
    page,
    limit,
    category,
    tag,
    q,
  })

  const posts = data.map(({ content, status: _s, createdAt: _c, ...post }) => ({
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    updatedAt: post.updatedAt.toISOString(),
    readingTime: computeReadingTime(content),
  }))

  return NextResponse.json(
    {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    { headers: CACHE_HEADERS },
  )
}

const translationSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
})

const createPostSchema = z.object({
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  author: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  coverImage: z.string().optional(),
  seriesId: z.string().optional(),
  seriesOrder: z.number().int().optional(),
  scheduledAt: z.string().optional(),
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

  const parsed = createPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const data = parsed.data

  const category = await getCategoryBySlug(data.category)
  if (!category) {
    return NextResponse.json({ error: 'Unknown category' }, { status: 422 })
  }

  if (data.status === 'published' && !data.translations.es) {
    return NextResponse.json(
      { error: 'Both translations required for published status' },
      { status: 422 },
    )
  }

  for (const [locale, t] of Object.entries(data.translations) as Array<
    ['en' | 'es', { slug: string }]
  >) {
    if (t && (await slugExistsForLocale(locale, t.slug))) {
      return NextResponse.json(
        { error: `Slug '${t.slug}' already taken for locale '${locale}'` },
        { status: 409 },
      )
    }
  }

  const post = await createPost(
    {
      category: data.category,
      tags: data.tags,
      author: data.author,
      status: data.status,
      coverImage: data.coverImage ?? null,
      seriesId: data.seriesId ?? null,
      seriesOrder: data.seriesOrder ?? null,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      previewToken: crypto.randomUUID(),
    },
    {
      en: data.translations.en,
      ...(data.translations.es ? { es: data.translations.es } : {}),
    },
  )

  return NextResponse.json(post, { status: 201 })
}

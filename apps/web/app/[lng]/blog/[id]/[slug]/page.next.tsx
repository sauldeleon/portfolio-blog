import { format } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { notFound, redirect } from 'next/navigation'

import { PostHero } from '@sdlgr/post-hero'

import { getPostById, getPublishedPosts } from '@web/lib/db/queries/posts'
import { renderMDX } from '@web/lib/mdx/renderMDX'
import { computeReadingTime } from '@web/utils/readingTime'

export const revalidate = 60

const dateLocales: Record<string, Locale> = { en: enUS, es }

interface RouteProps {
  params: Promise<{ lng: string; id: string; slug: string }>
}

export async function generateStaticParams() {
  const locales = ['en', 'es'] as const
  const results = await Promise.all(
    locales.map(async (lng) => {
      const posts = await getPublishedPosts(lng)
      return posts.map((p) => ({ lng, id: p.id, slug: p.slug }))
    }),
  )
  return results.flat()
}

export default async function BlogPostPage({ params }: RouteProps) {
  const { lng, id, slug } = await params
  const post = await getPostById(id, lng as 'en' | 'es')
  if (!post || post.status !== 'published') return notFound()
  if (post.slug !== slug)
    return redirect(`/${lng}/blog/${post.id}/${post.slug}`)

  const locale = dateLocales[lng] ?? enUS
  const publishedAt = post.publishedAt
    ? format(new Date(post.publishedAt), 'PP', { locale })
    : null

  return (
    <main>
      <PostHero
        title={post.title}
        coverImagePublicId={post.coverImage}
        category={post.category}
        author={post.author}
        publishedAt={publishedAt}
        readingTime={computeReadingTime(post.content)}
        lng={lng}
      />
      <article>{renderMDX(post.content)}</article>
    </main>
  )
}

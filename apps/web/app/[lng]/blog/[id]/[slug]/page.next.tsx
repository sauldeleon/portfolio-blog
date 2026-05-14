import { format } from 'date-fns'
import { Locale as DateLocale, enUS, es } from 'date-fns/locale'
import { notFound, redirect } from 'next/navigation'

import { PostHero } from '@sdlgr/post-hero'
import { TableOfContents } from '@sdlgr/table-of-contents'

import { RelatedPosts } from '@web/components/RelatedPosts/RelatedPosts'
import { SeriesIndicator } from '@web/components/SeriesIndicator/SeriesIndicator'
import { getServerTranslation } from '@web/i18n/server'
import { getPostById, getPublishedPosts } from '@web/lib/db/queries/posts'
import { Locale } from '@web/lib/db/schema'
import { extractToc } from '@web/lib/mdx/remarkHeadings'
import { renderMDX } from '@web/lib/mdx/renderMDX'
import { computeReadingTime } from '@web/utils/computeReadingTime'
import {
  buildAlternates,
  ogLocale,
  ogLocaleAlternate,
} from '@web/utils/metadata/inLanguage'

export const revalidate = 60

const dateLocales: Record<Locale, DateLocale> = { en: enUS, es }

interface RouteProps {
  params: Promise<{ lng: Locale; id: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    const locales = ['en', 'es'] as const
    const results = await Promise.all(
      locales.map(async (lng) => {
        const posts = await getPublishedPosts(lng)
        return posts.map((p) => ({ lng, id: p.id, slug: p.slug }))
      }),
    )
    return results.flat()
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: RouteProps) {
  const { lng, id } = await params

  const [post, postAlt] = await Promise.all([
    getPostById(id, lng),
    getPostById(id, lng === 'en' ? 'es' : 'en'),
  ])

  if (!post || post.status !== 'published') return {}

  const altSlug = postAlt?.slug ?? post.slug
  const altPath = `blog/${id}/${altSlug}`
  const ownPath = `blog/${id}/${post.slug}`

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      locale: ogLocale(lng),
      localeAlternate: ogLocaleAlternate(lng),
    },
    alternates: {
      ...buildAlternates(lng, ownPath),
      languages: {
        'en-US': `https://www.sawl.dev/en/${lng === 'en' ? ownPath : altPath}`,
        'en-GB': `https://www.sawl.dev/en/${lng === 'en' ? ownPath : altPath}`,
        'es-ES': `https://www.sawl.dev/es/${lng === 'es' ? ownPath : altPath}`,
        'x-default': `https://www.sawl.dev/en/${lng === 'en' ? ownPath : altPath}`,
      },
    },
  }
}

export default async function BlogPostPage({ params }: RouteProps) {
  const { lng, id, slug } = await params
  const { t } = await getServerTranslation({ ns: 'blogPage', language: lng })

  const post = await getPostById(id, lng)
  if (!post || post.status !== 'published') return notFound()
  if (post.slug !== slug)
    return redirect(`/${lng}/blog/${post.id}/${post.slug}`)

  const locale = dateLocales[lng] ?? enUS
  const publishedAt = post.publishedAt
    ? format(new Date(post.publishedAt), 'PP', { locale })
    : null

  const toc = extractToc(post.content)

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
      {toc.length > 0 && <TableOfContents entries={toc} label={t('toc')} />}
      <article>
        {renderMDX(post.content, {
          copyLabel: t('copyCode'),
          copiedLabel: t('codeCopied'),
        })}
      </article>
      {post.seriesId && (
        <SeriesIndicator
          postId={post.id}
          seriesId={post.seriesId}
          seriesOrder={post.seriesOrder ?? null}
          lng={lng}
        />
      )}
      <RelatedPosts postId={post.id} lng={lng} />
    </main>
  )
}

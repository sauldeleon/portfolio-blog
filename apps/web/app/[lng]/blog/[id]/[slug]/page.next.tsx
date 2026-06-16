import { format } from 'date-fns'
import { Locale as DateLocale, enUS, es } from 'date-fns/locale'
import { notFound, redirect } from 'next/navigation'
import { connection } from 'next/server'

import { PostHero } from '@sdlgr/post-hero'
import { TableOfContents } from '@sdlgr/table-of-contents'

import { JsonLd } from '@web/components/JsonLd/JsonLd'
import { PostComments } from '@web/components/PostComments'
import { PostContent } from '@web/components/PostContent/PostContent'
import { PostLikeButton } from '@web/components/PostLikeButton'
import { PreviewBanner } from '@web/components/PreviewBanner'
import { RelatedPosts } from '@web/components/RelatedPosts/RelatedPosts'
import { SeriesIndicator } from '@web/components/SeriesIndicator/SeriesIndicator'
import { SubscribeModal } from '@web/components/SubscribeModal'
import { getServerTranslation } from '@web/i18n/server'
import { auth } from '@web/lib/auth/config'
import { getCategoryTranslations } from '@web/lib/db/queries/categories'
import { getPostByNumber, getPublishedPosts } from '@web/lib/db/queries/posts'
import { Locale } from '@web/lib/db/schema'
import { logger } from '@web/lib/logger'
import { extractToc } from '@web/lib/mdx/remarkHeadings'
import { renderMDX } from '@web/lib/mdx/renderMDX'
import { generateArticleJsonLd } from '@web/lib/seo/generateArticleJsonLd'
import { CategoryIconRenderer } from '@web/utils/categoryIcons'
import { computeReadingTime } from '@web/utils/computeReadingTime'
import {
  buildAlternates,
  ogLocale,
  ogLocaleAlternate,
} from '@web/utils/metadata/inLanguage'
import { getSiteUrl } from '@web/utils/url/generateUrl'

import { StyledPage } from './page.next.styles'

export const revalidate = 3600

const dateLocales: Record<Locale, DateLocale> = { en: enUS, es }

async function getCategoryName(
  categorySlug: string,
  lng: Locale,
): Promise<string> {
  const translations = await getCategoryTranslations(categorySlug)
  return (
    translations.find((t) => t.locale === lng)?.name ??
    translations.find((t) => t.locale === 'en')?.name ??
    categorySlug
  )
}

interface RouteProps {
  params: Promise<{ lng: Locale; id: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    const locales = ['en', 'es'] as const
    const results = await Promise.all(
      locales.map(async (lng) => {
        const posts = await getPublishedPosts(lng)
        return posts.map((p) => ({
          lng,
          id: String(p.postNumber),
          slug: p.slug,
        }))
      }),
    )
    return results.flat()
  } catch (err) {
    logger.error(
      err,
      'generateStaticParams failed — posts will not be pre-rendered',
    )
    return []
  }
}

export async function generateMetadata({ params }: RouteProps) {
  const { lng, id } = await params
  const postNumber = parseInt(id, 10)
  if (isNaN(postNumber)) return {}

  const [post, postAlt] = await Promise.all([
    getPostByNumber(postNumber, lng as Locale),
    getPostByNumber(postNumber, (lng === 'en' ? 'es' : 'en') as Locale),
  ])

  if (!post || post.status !== 'published') return {}

  const altSlug = postAlt?.slug ?? post.slug
  const altPath = `blog/${postNumber}/${altSlug}`
  const ownPath = `blog/${postNumber}/${post.slug}`

  const deploymentUrl = getSiteUrl()
  const categoryName = await getCategoryName(post.category, lng as Locale)
  const ogParams = new URLSearchParams([['title', post.title]])
  if (post.coverImage) ogParams.set('cover', post.coverImage)
  if (post.category) ogParams.set('category', categoryName)
  const ogImageUrl = `${deploymentUrl}/og?${ogParams.toString()}`
  const postUrl = `${deploymentUrl}/${lng}/blog/${postNumber}/${post.slug}`

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      url: postUrl,
      title: post.title,
      description: post.excerpt,
      locale: ogLocale(lng),
      alternateLocale: ogLocaleAlternate(lng),
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author],
      section: categoryName,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: post.title,
      description: post.excerpt,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
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
  const { t: tSubscribe } = await getServerTranslation({
    ns: 'subscribe',
    language: lng,
  })

  const postNumber = parseInt(id, 10)
  if (isNaN(postNumber)) return notFound()
  const post = await getPostByNumber(postNumber, lng as Locale)
  if (!post) return notFound()
  const isPreview = post.status !== 'published'
  if (isPreview) {
    await connection()
    const session = await auth()
    if (!session) return notFound()
  }
  if (post.slug !== slug)
    return redirect(`/${lng}/blog/${post.postNumber}/${post.slug}`)

  const locale = dateLocales[lng] ?? enUS
  const publishedAt = post.publishedAt
    ? format(new Date(post.publishedAt), 'PP', { locale })
    : null

  const [toc, categoryName] = await Promise.all([
    Promise.resolve(extractToc(post.content)),
    getCategoryName(post.category, lng as Locale),
  ])
  const postUrl = `${getSiteUrl()}/${lng}/blog/${post.postNumber}/${post.slug}`

  return (
    <StyledPage>
      {isPreview && <PreviewBanner label={t('preview.banner')} />}
      <JsonLd data={generateArticleJsonLd(post, lng, postUrl)} />
      <PostHero
        title={post.title}
        coverImagePublicId={post.coverImage}
        coverImageFit={post.coverImageFit}
        category={categoryName}
        tags={post.tags}
        author={post.author}
        publishedAt={publishedAt}
        readingTime={computeReadingTime(post.content)}
        lng={lng}
        seriesTitle={post.seriesTitle}
        seriesOrder={post.seriesOrder}
        url={postUrl}
        shareLabel={t('share')}
        copyLinkLabel={t('share.copyLink')}
        copiedLabel={t('share.copied')}
        categoryIcon={<CategoryIconRenderer slug={post.category} aria-hidden />}
        actions={
          <>
            <PostLikeButton postId={post.id} initialLikes={post.likes} />
            <SubscribeModal
              lng={lng}
              buttonLabel={tSubscribe('buttonLabel')}
              buttonAriaLabel={tSubscribe('buttonAriaLabel')}
              compact
            />
          </>
        }
      />
      {toc.length > 0 && <TableOfContents entries={toc} label={t('toc')} />}
      <PostContent>
        {renderMDX(post.content, {
          copyLabel: t('copyCode'),
          copiedLabel: t('codeCopied'),
        })}
      </PostContent>
      {post.seriesId && (
        <SeriesIndicator
          postId={post.id}
          seriesId={post.seriesId}
          seriesOrder={post.seriesOrder ?? null}
          lng={lng}
        />
      )}
      <RelatedPosts postId={post.id} lng={lng} />
      <PostComments
        postId={post.id}
        postTitle={post.title}
        postNumber={post.postNumber}
        postSlug={post.slug}
        lng={lng}
        commentsEnabled={post.commentsEnabled}
      />
    </StyledPage>
  )
}

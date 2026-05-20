import { format } from 'date-fns'
import { type Locale as DateLocale, enUS, es } from 'date-fns/locale'

import { PostHero } from '@sdlgr/post-hero'

import type { PostWithContent } from '@web/lib/db/queries/posts'
import { type Locale } from '@web/lib/db/schema'
import { computeReadingTime } from '@web/utils/computeReadingTime'

const dateLocales: Record<Locale, DateLocale> = { en: enUS, es }

export interface LatestPostHeroProps {
  post: PostWithContent
  lng: Locale
  readMoreLabel: string
}

export function LatestPostHero({
  post,
  lng,
  readMoreLabel,
}: LatestPostHeroProps) {
  const dateLocale = dateLocales[lng] ?? enUS
  const url = `/${lng}/blog/${post.postNumber}/${post.slug}`

  return (
    <div data-testid="latest-post-hero">
      <PostHero
        title={post.title}
        coverImagePublicId={post.coverImage}
        coverImageFit={post.coverImageFit}
        category={post.category}
        tags={post.tags}
        author={post.author}
        publishedAt={
          post.publishedAt
            ? format(new Date(post.publishedAt), 'PP', { locale: dateLocale })
            : null
        }
        readingTime={computeReadingTime(post.content)}
        lng={lng}
        seriesTitle={post.seriesTitle}
        seriesOrder={post.seriesOrder}
        url={url}
      />
      <a href={url} data-testid="latest-post-hero-link">
        {readMoreLabel}
      </a>
    </div>
  )
}

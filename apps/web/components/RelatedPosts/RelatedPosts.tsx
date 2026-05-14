import { format } from 'date-fns'
import { type Locale as DateLocale, enUS, es } from 'date-fns/locale'

import { PostCard } from '@sdlgr/post-card'

import { getServerTranslation } from '@web/i18n/server'
import { getRelatedPosts } from '@web/lib/db/queries/posts'
import { Locale } from '@web/lib/db/schema'
import { computeReadingTime } from '@web/utils/computeReadingTime'

import { StyledHeading, StyledList, StyledSection } from './RelatedPosts.styles'

const dateLocales: Record<Locale, DateLocale> = { en: enUS, es }

export interface RelatedPostsProps {
  postId: string
  lng: Locale
}

export async function RelatedPosts({ postId, lng }: RelatedPostsProps) {
  const { t } = await getServerTranslation({ ns: 'blogPage', language: lng })
  const posts = await getRelatedPosts(postId, lng)

  if (posts.length === 0) return null

  const locale = dateLocales[lng] ?? enUS

  return (
    <StyledSection>
      <StyledHeading>{t('relatedPosts')}</StyledHeading>
      <StyledList>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            slug={post.slug}
            title={post.title}
            excerpt={post.excerpt}
            author={post.author}
            publishedAt={
              post.publishedAt
                ? format(new Date(post.publishedAt), 'PP', { locale })
                : null
            }
            readingTime={computeReadingTime(post.content)}
            category={post.category}
            tags={post.tags}
            coverImagePublicId={post.coverImage}
            lng={lng}
            readMoreLabel={t('readMore')}
          />
        ))}
      </StyledList>
    </StyledSection>
  )
}

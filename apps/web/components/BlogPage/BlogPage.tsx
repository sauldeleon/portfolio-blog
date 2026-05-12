import { format } from 'date-fns'
import { type Locale as DateLocale, enUS, es } from 'date-fns/locale'

import { CategoryFilter } from '@sdlgr/blog-filters'
import { TagFilter } from '@sdlgr/blog-filters'
import { Pagination } from '@sdlgr/pagination'
import { PostCard } from '@sdlgr/post-card'

import { getServerTranslation } from '@web/i18n/server'
import { getCategories } from '@web/lib/db/queries/categories'
import { getPublishedPostsPaginated } from '@web/lib/db/queries/posts'
import { getPostCountPerTag } from '@web/lib/db/queries/tags'
import { Locale } from '@web/lib/db/schema'
import { computeReadingTime } from '@web/utils/computeReadingTime'

import {
  StyledEmpty,
  StyledFilters,
  StyledGrid,
  StyledHeader,
  StyledHeading,
  StyledHeadingAccent,
  StyledPage,
  StyledPaginationWrapper,
} from './BlogPage.styles'

const POSTS_PER_PAGE = 10

const dateLocales: Record<Locale, DateLocale> = { en: enUS, es }

export interface BlogPageProps {
  lng: Locale
  page?: string
  category?: string
  tag?: string
  q?: string
}

export async function BlogPage({
  lng,
  page = '1',
  category,
  tag,
  q,
}: BlogPageProps) {
  const currentPage = Math.max(1, parseInt(page, 10) || 1)
  const locale = dateLocales[lng] ?? enUS

  const [postsResult, categories, tags] = await Promise.all([
    getPublishedPostsPaginated({
      locale: lng,
      page: currentPage,
      limit: POSTS_PER_PAGE,
      category,
      tag,
      q,
    }),
    getCategories(),
    getPostCountPerTag(),
  ])

  const { t } = await getServerTranslation({ ns: 'blogPage', language: lng })

  return (
    <StyledPage>
      <StyledHeader>
        <StyledHeading>{t('title')}</StyledHeading>
        <StyledHeadingAccent aria-hidden />
      </StyledHeader>
      <StyledFilters>
        <CategoryFilter
          categories={categories.map((cat) => ({
            id: cat.id,
            slug: cat.slug,
            name: `${cat.name} (${cat.postCount})`,
            description: cat.description,
          }))}
          activeCategory={category ?? null}
          allLabel={t('allCategories')}
        />
        <TagFilter
          tags={tags}
          activeTag={tag ?? null}
          allLabel={t('allTags')}
        />
      </StyledFilters>
      {postsResult.data.length === 0 ? (
        <StyledEmpty>{t('noResults')}</StyledEmpty>
      ) : (
        <StyledGrid>
          {postsResult.data.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              coverImagePublicId={post.coverImage}
              category={post.category}
              tags={post.tags}
              readingTime={computeReadingTime(post.content)}
              publishedAt={
                post.publishedAt
                  ? format(new Date(post.publishedAt), 'PP', { locale })
                  : null
              }
              author={post.author}
              lng={lng}
              readMoreLabel={t('readMore')}
            />
          ))}
        </StyledGrid>
      )}
      <StyledPaginationWrapper>
        <Pagination
          total={postsResult.total}
          page={currentPage}
          limit={POSTS_PER_PAGE}
          previousLabel={t('pagination.previous')}
          nextLabel={t('pagination.next')}
        />
      </StyledPaginationWrapper>
    </StyledPage>
  )
}

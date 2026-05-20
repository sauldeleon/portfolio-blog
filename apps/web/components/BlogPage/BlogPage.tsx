import { format } from 'date-fns'
import { type Locale as DateLocale, enUS, es } from 'date-fns/locale'

import { BlogFilters } from '@sdlgr/blog-filters'
import { Pagination } from '@sdlgr/pagination'
import { PostCard } from '@sdlgr/post-card'

import { LatestPostHero } from '@web/components/LatestPostHero'
import { getServerTranslation } from '@web/i18n/server'
import {
  getCategories,
  getCategoryByLocaleSlug,
} from '@web/lib/db/queries/categories'
import {
  type PublishedDateGroup,
  getLatestPublishedPost,
  getPostPublishedDates,
  getPublishedPostsPaginated,
} from '@web/lib/db/queries/posts'
import { getPostCountPerTag } from '@web/lib/db/queries/tags'
import { Locale } from '@web/lib/db/schema'
import { computeReadingTime } from '@web/utils/computeReadingTime'

import {
  StyledEmpty,
  StyledFilters,
  StyledGrid,
  StyledHeroWrapper,
  StyledPage,
  StyledPaginationWrapper,
} from './BlogPage.styles'

const POSTS_PER_PAGE = 9

const dateLocales: Record<Locale, DateLocale> = { en: enUS, es }

export function mergeDateCounts(
  all: PublishedDateGroup[],
  filtered: PublishedDateGroup[],
): PublishedDateGroup[] {
  const filteredByYear = new Map(filtered.map((g) => [g.year, g]))
  return all.map((yearGroup) => {
    const filteredYear = filteredByYear.get(yearGroup.year)
    if (!filteredYear) {
      return {
        ...yearGroup,
        count: 0,
        months: yearGroup.months.map((m) => ({ ...m, count: 0 })),
      }
    }
    const filteredByMonth = new Map(
      filteredYear.months.map((m) => [m.month, m.count]),
    )
    return {
      ...yearGroup,
      count: filteredYear.count,
      months: yearGroup.months.map((m) => ({
        ...m,
        count: filteredByMonth.get(m.month) ?? 0,
      })),
    }
  })
}

export interface BlogPageProps {
  lng: Locale
  page?: string
  categories?: string
  tags?: string
  q?: string
  year?: string
  month?: string
}

export async function BlogPage({
  lng,
  page = '1',
  categories,
  tags,
  q,
  year,
  month,
}: BlogPageProps) {
  const currentPage = Math.max(1, parseInt(page, 10) || 1)
  const locale = dateLocales[lng] ?? enUS

  const activeCategories = categories
    ? categories.split(',').filter(Boolean)
    : []
  const activeTags = tags ? tags.split(',').filter(Boolean) : []
  const activeYear = year ? parseInt(year, 10) || null : null
  const activeMonth = month ? parseInt(month, 10) || null : null

  const latestPost = await getLatestPublishedPost(lng)
  const heroId = latestPost?.id

  const canonicalCategories = await Promise.all(
    activeCategories.map(async (slug) => {
      const resolved = await getCategoryByLocaleSlug(slug, lng)
      return resolved?.canonicalSlug ?? slug
    }),
  )

  const hasDateCrossFilters = !!(
    activeTags.length || canonicalCategories.length
  )

  const [categoriesData, tagsData, allDates, filteredDatesResult, gridResult] =
    await Promise.all([
      getCategories(lng, heroId, {
        tags: activeTags,
        year: activeYear ?? undefined,
        month: activeMonth ?? undefined,
      }),
      getPostCountPerTag(heroId, {
        categories: canonicalCategories,
        year: activeYear ?? undefined,
        month: activeMonth ?? undefined,
      }),
      getPostPublishedDates(lng, heroId),
      hasDateCrossFilters
        ? getPostPublishedDates(lng, heroId, {
            categories: canonicalCategories,
            tags: activeTags,
          })
        : Promise.resolve(null),
      getPublishedPostsPaginated({
        locale: lng,
        page: currentPage,
        limit: POSTS_PER_PAGE,
        categories: canonicalCategories.length
          ? canonicalCategories
          : undefined,
        tags: activeTags.length ? activeTags : undefined,
        q,
        year: activeYear ?? undefined,
        month: activeMonth ?? undefined,
        excludeId: heroId,
      }),
    ])

  const publishedDates = filteredDatesResult
    ? mergeDateCounts(allDates, filteredDatesResult)
    : allDates

  const { t } = await getServerTranslation({ ns: 'blogPage', language: lng })

  const monthNames = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2024, i, 1), 'MMM', { locale }),
  )

  return (
    <StyledPage>
      {latestPost && (
        <StyledHeroWrapper>
          <LatestPostHero
            post={latestPost}
            lng={lng}
            readMoreLabel={t('readMore')}
          />
        </StyledHeroWrapper>
      )}
      <StyledFilters>
        <BlogFilters
          categories={categoriesData.map((cat) => ({
            id: cat.id,
            slug: cat.localeSlug,
            name: `${cat.name} (${cat.publishedPostCount})`,
            description: cat.description,
          }))}
          activeCategories={activeCategories}
          categoriesLabel={t('categoriesLabel')}
          tags={tagsData}
          activeTags={activeTags}
          tagsLabel={t('tags')}
          dates={publishedDates}
          activeYear={activeYear}
          activeMonth={activeMonth}
          dateLabel={t('dateLabel')}
          monthNames={monthNames}
          searchPlaceholder={t('searchPlaceholder')}
          initialQ={q}
          applyLabel={t('applyFilters')}
          clearAllLabel={t('clearFilters')}
          tagSearchPlaceholder={t('tagSearchPlaceholder')}
        />
      </StyledFilters>
      {gridResult.data.length === 0 ? (
        <StyledEmpty>{t('noResults')}</StyledEmpty>
      ) : (
        <StyledGrid>
          {gridResult.data.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              postNumber={post.postNumber}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              coverImagePublicId={post.coverImage}
              coverImageFit={post.coverImageFit ?? undefined}
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
              seriesTitle={post.seriesTitle}
              seriesOrder={post.seriesOrder}
              readMoreLabel={t('readMore')}
            />
          ))}
        </StyledGrid>
      )}
      <StyledPaginationWrapper>
        <Pagination
          total={gridResult.total}
          page={currentPage}
          limit={POSTS_PER_PAGE}
          previousLabel={t('pagination.previous')}
          nextLabel={t('pagination.next')}
        />
      </StyledPaginationWrapper>
    </StyledPage>
  )
}

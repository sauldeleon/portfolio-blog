import { getServerTranslation } from '@web/i18n/server'
import { getPostsBySeries } from '@web/lib/db/queries/posts'

import {
  StyledCurrentLabel,
  StyledHeading,
  StyledItem,
  StyledLink,
  StyledList,
  StyledOrder,
  StyledPartLabel,
  StyledSection,
} from './SeriesIndicator.styles'

export interface SeriesIndicatorProps {
  postId: string
  seriesId: string
  seriesOrder: number | null
  lng: 'en' | 'es'
}

export async function SeriesIndicator({
  postId,
  seriesId,
  seriesOrder,
  lng,
}: SeriesIndicatorProps) {
  const { t } = await getServerTranslation({ ns: 'blogPage', language: lng })
  const seriesPosts = await getPostsBySeries(seriesId, lng)

  if (seriesPosts.length === 0) return null

  return (
    <StyledSection aria-label={t('seriesIndicator.heading', { seriesId })}>
      <StyledHeading>
        {t('seriesIndicator.heading', { seriesId })}
      </StyledHeading>
      {seriesOrder != null && (
        <StyledPartLabel>
          {t('seriesIndicator.part', { order: seriesOrder })}
        </StyledPartLabel>
      )}
      <StyledList>
        {seriesPosts.map((post) => {
          const isCurrent = post.id === postId
          return (
            <StyledItem key={post.id} $current={isCurrent}>
              {post.seriesOrder != null && (
                <StyledOrder>{post.seriesOrder}.</StyledOrder>
              )}
              {isCurrent ? (
                <StyledCurrentLabel>{post.title}</StyledCurrentLabel>
              ) : (
                <StyledLink href={`/${lng}/blog/${post.id}/${post.slug}`}>
                  {post.title}
                </StyledLink>
              )}
            </StyledItem>
          )
        })}
      </StyledList>
    </StyledSection>
  )
}

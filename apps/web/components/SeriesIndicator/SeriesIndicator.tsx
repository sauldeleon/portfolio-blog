import { getServerTranslation } from '@web/i18n/server'
import { getPostsBySeries } from '@web/lib/db/queries/posts'

import { SeriesIndicatorUI } from './SeriesIndicatorUI'

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

  const heading = t('seriesIndicator.heading', { seriesId })
  const partLabel =
    seriesOrder != null
      ? t('seriesIndicator.part', { order: seriesOrder })
      : null

  const posts = seriesPosts.map(
    ({ id, postNumber, title, slug, seriesOrder: order }) => ({
      id,
      postNumber,
      title,
      slug,
      seriesOrder: order,
    }),
  )

  return (
    <SeriesIndicatorUI
      posts={posts}
      postId={postId}
      lng={lng}
      heading={heading}
      partLabel={partLabel}
    />
  )
}

'use client'

import dynamic from 'next/dynamic'

import { useClientTranslation } from '@web/i18n/client'

import { StyledEmbedWrapper } from './PostContent.styles'

const GpxMap = dynamic(
  () => import('@sdlgr/gpx-map').then((m) => ({ default: m.GpxMap })),
  { ssr: false },
)

export function PostContentEmbed({
  type,
  url,
  showWaypoints,
  allowDownload,
  waypointImages,
}: {
  type?: string
  url?: string
  showWaypoints?: boolean
  allowDownload?: boolean
  waypointImages?: string
}) {
  const { t } = useClientTranslation('common')

  if (!url) return null

  if (type === 'gpx') {
    const parsedWaypointImages = waypointImages
      ? (JSON.parse(waypointImages) as Record<string, string>)
      : undefined
    return (
      <GpxMap
        url={url}
        showWaypoints={showWaypoints}
        allowDownload={allowDownload}
        waypointImages={parsedWaypointImages}
        downloadLabel={t('gpxMap.downloadGpx')}
        labels={{
          waypoints: t('gpxMap.waypoints'),
          colName: t('gpxMap.colName'),
          colCoordinates: t('gpxMap.colCoordinates'),
          colElevation: t('gpxMap.colElevation'),
          flyTo: t('gpxMap.flyTo'),
        }}
      />
    )
  }

  return (
    <StyledEmbedWrapper data-testid="post-embed-wrapper">
      <iframe src={url} allowFullScreen title={type ?? 'embed'} />
    </StyledEmbedWrapper>
  )
}

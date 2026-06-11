'use client'

import dynamic from 'next/dynamic'

import type { GpxTrackDef } from '@sdlgr/gpx-map'

import { useClientTranslation } from '@web/i18n/client'

import { StyledEmbedWrapper } from './PostContent.styles'

const GpxMap = dynamic(
  () => import('@sdlgr/gpx-map').then((m) => ({ default: m.GpxMap })),
  { ssr: false },
)

export function PostContentEmbed({
  type,
  url,
  tracks,
  showWaypoints,
  allowDownload,
  waypointImages,
}: {
  type?: string
  url?: string
  tracks?: string
  showWaypoints?: boolean
  allowDownload?: boolean
  waypointImages?: string
}) {
  const { t } = useClientTranslation('common')

  if (type === 'gpx') {
    const parsedTracks = tracks
      ? (JSON.parse(tracks) as GpxTrackDef[])
      : undefined
    const parsedWaypointImages = waypointImages
      ? (JSON.parse(waypointImages) as Record<string, string>)
      : undefined

    if (!parsedTracks && !url) return null

    return (
      <GpxMap
        url={parsedTracks ? undefined : url}
        tracks={parsedTracks}
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

  if (!url) return null

  return (
    <StyledEmbedWrapper data-testid="post-embed-wrapper">
      <iframe
        src={url}
        allowFullScreen
        allow="pointer-lock"
        title={type ?? 'embed'}
      />
    </StyledEmbedWrapper>
  )
}

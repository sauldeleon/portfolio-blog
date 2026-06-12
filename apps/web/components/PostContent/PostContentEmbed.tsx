'use client'

import dynamic from 'next/dynamic'

import type { GpxTrackDef } from '@sdlgr/gpx-map'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledEmbed360Badge,
  StyledEmbed360Info,
  StyledEmbed360Link,
  StyledEmbed360Overlay,
  StyledEmbed360Thumbnail,
  StyledEmbed360Wrapper,
  StyledEmbedWrapper,
} from './PostContent.styles'

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

  if (type === 'youtube-360') {
    const videoId = url.match(/youtube\.com\/embed\/([^?&/]+)/)?.[1] ?? null
    const watchUrl = videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : url
    const thumbnailUrl = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null

    return (
      <StyledEmbed360Wrapper data-testid="post-embed-360-wrapper">
        {thumbnailUrl && (
          <StyledEmbed360Thumbnail src={thumbnailUrl} alt="" aria-hidden />
        )}
        <StyledEmbed360Overlay>
          <StyledEmbed360Badge>360°</StyledEmbed360Badge>
          <StyledEmbed360Info>{t('embed.360info')}</StyledEmbed360Info>
          <StyledEmbed360Link
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('embed.watchOnYouTube')}
          </StyledEmbed360Link>
        </StyledEmbed360Overlay>
      </StyledEmbed360Wrapper>
    )
  }

  return (
    <StyledEmbedWrapper data-testid="post-embed-wrapper">
      <iframe
        src={url}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; pointer-lock"
        title={type ?? 'embed'}
      />
    </StyledEmbedWrapper>
  )
}

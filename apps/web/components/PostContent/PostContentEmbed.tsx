'use client'

import dynamic from 'next/dynamic'

import { StyledEmbedWrapper } from './PostContent.styles'

const GpxMap = dynamic(
  () => import('@sdlgr/gpx-map').then((m) => ({ default: m.GpxMap })),
  { ssr: false },
)

export function PostContentEmbed({
  type,
  url,
  showWaypoints,
}: {
  type?: string
  url?: string
  showWaypoints?: boolean
}) {
  if (!url) return null

  if (type === 'gpx') {
    return <GpxMap url={url} showWaypoints={showWaypoints} />
  }

  return (
    <StyledEmbedWrapper data-testid="post-embed-wrapper">
      <iframe src={url} allowFullScreen title={type ?? 'embed'} />
    </StyledEmbedWrapper>
  )
}

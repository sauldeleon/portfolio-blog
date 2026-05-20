'use client'

import { StyledEmbedWrapper } from './PostContent.styles'

export function PostContentEmbed({
  type,
  url,
}: {
  type?: string
  url?: string
}) {
  if (!url) return null
  return (
    <StyledEmbedWrapper data-testid="post-embed-wrapper">
      <iframe src={url} allowFullScreen title={type ?? 'embed'} />
    </StyledEmbedWrapper>
  )
}

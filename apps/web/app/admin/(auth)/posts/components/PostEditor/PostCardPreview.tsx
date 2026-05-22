'use client'

import { PostCard } from '@sdlgr/post-card'

import { computeReadingTime } from '@web/utils/computeReadingTime'

import {
  StyledPreviewCardConstraint,
  StyledPreviewCardWrapper,
  StyledPreviewSection,
} from './PostCardPreview.styles'

interface PostCardPreviewProps {
  title: string
  slug: string
  excerpt: string
  content: string
  categoryName: string
  tags: string[]
  coverImage: string
  coverImageFit?: 'cover' | 'contain'
  seriesTitle?: string
  seriesOrder?: number | null
  author: string
  lng: string
  postNumber?: number
}

export function PostCardPreview({
  title,
  slug,
  excerpt,
  content,
  categoryName,
  tags,
  coverImage,
  coverImageFit,
  seriesTitle,
  seriesOrder,
  author,
  lng,
  postNumber,
}: PostCardPreviewProps) {
  const readingTime = computeReadingTime(content)
  const publishedAt = new Date().toLocaleDateString()

  return (
    <StyledPreviewSection data-testid="post-card-preview">
      <StyledPreviewCardWrapper>
        <StyledPreviewCardConstraint>
          <PostCard
            id="preview"
            postNumber={postNumber}
            slug={slug}
            title={title}
            excerpt={excerpt}
            author={author}
            publishedAt={publishedAt}
            readingTime={readingTime}
            category={categoryName}
            tags={tags}
            coverImagePublicId={coverImage || null}
            coverImageFit={coverImageFit}
            seriesTitle={seriesTitle || null}
            seriesOrder={seriesOrder}
            lng={lng}
            readMoreLabel="Read more"
          />
        </StyledPreviewCardConstraint>
      </StyledPreviewCardWrapper>
    </StyledPreviewSection>
  )
}

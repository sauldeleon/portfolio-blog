'use client'

import { PostCard } from '@sdlgr/post-card'

import { useClientTranslation } from '@web/i18n/client'
import { computeReadingTime } from '@web/utils/computeReadingTime'

import {
  StyledPreviewCardConstraint,
  StyledPreviewCardWrapper,
  StyledPreviewSection,
} from './PostCardPreview.styles'
import { PreviewSectionLabel } from './PreviewSectionLabel'

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
  const { t } = useClientTranslation('admin')
  const readingTime = computeReadingTime(content)
  const publishedAt = new Date().toLocaleDateString()

  return (
    <StyledPreviewSection data-testid="post-card-preview">
      <PreviewSectionLabel>{t('postEditor.cardPreview')}</PreviewSectionLabel>
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

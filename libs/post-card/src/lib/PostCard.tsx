'use client'

import { CldImage } from 'next-cloudinary'

import {
  StyledBody,
  StyledCard,
  StyledCardOverlay,
  StyledCategory,
  StyledCover,
  StyledExcerpt,
  StyledMeta,
  StyledMoreTags,
  StyledPlaceholder,
  StyledReadMore,
  StyledSeriesBadge,
  StyledTag,
  StyledTagList,
  StyledTitle,
} from './PostCard.styles'

const MAX_TAGS = 3

export interface PostCardProps {
  id: string
  postNumber?: number
  slug: string
  title: string
  excerpt: string
  author: string
  publishedAt: string | null
  readingTime: number
  category: string
  tags: string[]
  coverImagePublicId: string | null
  coverImageFit?: 'cover' | 'contain'
  seriesTitle?: string | null
  seriesOrder?: number | null
  lng: string
  readMoreLabel: string
}

export function PostCard({
  id,
  postNumber,
  slug,
  title,
  excerpt,
  author,
  publishedAt,
  readingTime,
  category,
  tags,
  coverImagePublicId,
  coverImageFit,
  seriesTitle,
  seriesOrder,
  lng,
  readMoreLabel,
}: PostCardProps) {
  const visibleTags = tags.slice(0, MAX_TAGS)
  const extraTagCount = tags.length - MAX_TAGS

  const href = postNumber != null ? `/${lng}/blog/${postNumber}/${slug}` : '#'

  return (
    <StyledCard>
      <StyledCardOverlay href={href} aria-hidden="true" tabIndex={-1} />
      <StyledCover $fit={coverImageFit}>
        {coverImagePublicId ? (
          <CldImage
            src={coverImagePublicId}
            alt={title}
            width={400}
            height={225}
          />
        ) : (
          <StyledPlaceholder aria-hidden="true" />
        )}
      </StyledCover>
      <StyledBody>
        <StyledCategory>{category}</StyledCategory>
        {seriesTitle && (
          <StyledSeriesBadge data-testid="series-badge">
            <span>{seriesTitle}</span>
            {seriesOrder != null && <span>#{seriesOrder}</span>}
          </StyledSeriesBadge>
        )}
        <StyledTitle>{title}</StyledTitle>
        <StyledExcerpt>{excerpt}</StyledExcerpt>
        <StyledMeta>
          <span>{author}</span>
          {publishedAt && <time dateTime={publishedAt}>{publishedAt}</time>}
          <span>{readingTime} min</span>
        </StyledMeta>
        <StyledTagList>
          {visibleTags.map((tag) => (
            <StyledTag key={tag}>{tag}</StyledTag>
          ))}
          {extraTagCount > 0 && (
            <StyledMoreTags>+{extraTagCount}</StyledMoreTags>
          )}
        </StyledTagList>
        <StyledReadMore href={href}>{readMoreLabel}</StyledReadMore>
      </StyledBody>
    </StyledCard>
  )
}

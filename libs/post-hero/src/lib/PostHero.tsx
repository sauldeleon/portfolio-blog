'use client'

import { CldImage } from 'next-cloudinary'

import {
  StyledBadgeRow,
  StyledCategory,
  StyledCoverWrapper,
  StyledHeader,
  StyledHeroContent,
  StyledMeta,
  StyledMetaSep,
  StyledPostTitle,
  StyledSeriesBadge,
  StyledTag,
} from './PostHero.styles'
import { ShareButtons } from './ShareButtons'

export interface PostHeroProps {
  title: string
  coverImagePublicId: string | null
  coverImageFit?: 'cover' | 'contain' | null
  category: string
  tags?: string[]
  author: string
  publishedAt: string | null
  readingTime: number
  lng: string
  seriesTitle?: string | null
  seriesOrder?: number | null
  url?: string
  shareLabel?: string
  copyLinkLabel?: string
  copiedLabel?: string
}

export function PostHero({
  title,
  coverImagePublicId,
  coverImageFit,
  category,
  tags = [],
  author,
  publishedAt,
  readingTime,
  seriesTitle,
  seriesOrder,
  url,
  shareLabel,
  copyLinkLabel,
  copiedLabel,
}: PostHeroProps) {
  return (
    <StyledHeader>
      {coverImagePublicId && (
        <StyledCoverWrapper $fit={coverImageFit ?? 'cover'}>
          <CldImage
            src={coverImagePublicId}
            alt={title}
            fill
            sizes="(max-width: 1440px) 100vw, 1440px"
            style={{ objectFit: coverImageFit ?? 'cover' }}
          />
        </StyledCoverWrapper>
      )}
      <StyledHeroContent>
        <StyledCategory>{category}</StyledCategory>
        {(seriesTitle || tags.length > 0) && (
          <StyledBadgeRow>
            {seriesTitle && (
              <StyledSeriesBadge data-testid="series-badge">
                <span>{seriesTitle}</span>
                {seriesOrder != null && <span>#{seriesOrder}</span>}
              </StyledSeriesBadge>
            )}
            {tags.map((tag) => (
              <StyledTag key={tag} data-testid="tag">
                {tag}
              </StyledTag>
            ))}
          </StyledBadgeRow>
        )}
        <StyledPostTitle>{title}</StyledPostTitle>
        <StyledMeta>
          <span>{author}</span>
          {publishedAt && (
            <>
              <StyledMetaSep aria-hidden>|</StyledMetaSep>
              <time dateTime={publishedAt}>{publishedAt}</time>
            </>
          )}
          <StyledMetaSep aria-hidden>|</StyledMetaSep>
          <span data-testid="reading-time">{readingTime} min</span>
          {url && (
            <>
              <StyledMetaSep aria-hidden>|</StyledMetaSep>
              <ShareButtons
                url={url}
                title={title}
                label={shareLabel}
                copyLinkLabel={copyLinkLabel}
                copiedLabel={copiedLabel}
              />
            </>
          )}
        </StyledMeta>
      </StyledHeroContent>
    </StyledHeader>
  )
}

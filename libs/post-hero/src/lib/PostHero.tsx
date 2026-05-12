import { CldImage } from 'next-cloudinary'

import { StyledCategory, StyledHeader, StyledMeta } from './PostHero.styles'

export interface PostHeroProps {
  title: string
  coverImagePublicId: string | null
  category: string
  author: string
  publishedAt: string | null
  readingTime: number
  lng: string
}

export function PostHero({
  title,
  coverImagePublicId,
  category,
  author,
  publishedAt,
  readingTime,
  lng,
}: PostHeroProps) {
  return (
    <StyledHeader>
      {coverImagePublicId ? (
        <CldImage
          src={coverImagePublicId}
          alt={title}
          width={1200}
          height={630}
        />
      ) : (
        <div data-testid="cover-placeholder" />
      )}
      <StyledCategory>{category}</StyledCategory>
      <h1>{title}</h1>
      <StyledMeta>
        <span>{author}</span>
        {publishedAt && <time dateTime={publishedAt}>{publishedAt}</time>}
        <span data-testid="reading-time">{readingTime} min</span>
      </StyledMeta>
    </StyledHeader>
  )
}

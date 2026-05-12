'use client'

import { CldImage } from 'next-cloudinary'
import Link from 'next/link'

import {
  StyledCard,
  StyledCategory,
  StyledCover,
  StyledExcerpt,
  StyledMeta,
  StyledMoreTags,
  StyledPlaceholder,
  StyledReadMore,
  StyledTag,
  StyledTagList,
  StyledTitle,
} from './PostCard.styles'

const MAX_TAGS = 3

export interface PostCardProps {
  id: string
  slug: string
  title: string
  excerpt: string
  author: string
  publishedAt: string | null
  readingTime: number
  category: string
  tags: string[]
  coverImagePublicId: string | null
  lng: string
  readMoreLabel: string
}

export function PostCard({
  id,
  slug,
  title,
  excerpt,
  author,
  publishedAt,
  readingTime,
  category,
  tags,
  coverImagePublicId,
  lng,
  readMoreLabel,
}: PostCardProps) {
  const visibleTags = tags.slice(0, MAX_TAGS)
  const extraTagCount = tags.length - MAX_TAGS

  return (
    <StyledCard>
      <StyledCover>
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
      <StyledCategory>{category}</StyledCategory>
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
        {extraTagCount > 0 && <StyledMoreTags>+{extraTagCount}</StyledMoreTags>}
      </StyledTagList>
      <StyledReadMore>
        <Link href={`/${lng}/blog/${id}/${slug}`}>{readMoreLabel}</Link>
      </StyledReadMore>
    </StyledCard>
  )
}

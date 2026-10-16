'use client'

import { format } from 'date-fns'
import { type Locale as DateLocale, enUS, es } from 'date-fns/locale'
import { CldImage, getCldImageUrl } from 'next-cloudinary'

import { BLUR_PLACEHOLDER_OPTIONS, BlurUp } from '@sdlgr/blur-up'

import type { PostWithContent } from '@web/lib/db/queries/posts'
import { type Locale } from '@web/lib/db/schema'
import { CategoryIconRenderer } from '@web/utils/categoryIcons'

import {
  StyledBadgeRow,
  StyledCategoryBadge,
  StyledContent,
  StyledCoverWrapper,
  StyledExcerpt,
  StyledMeta,
  StyledMetaSep,
  StyledReadMoreLink,
  StyledSeriesBadge,
  StyledTag,
  StyledTitle,
  StyledWrapper,
} from './LatestPostHero.styles'

const dateLocales: Record<Locale, DateLocale> = { en: enUS, es }

export interface LatestPostHeroProps {
  post: PostWithContent
  lng: Locale
  readMoreLabel: string
}

export function LatestPostHero({
  post,
  lng,
  readMoreLabel,
}: LatestPostHeroProps) {
  const dateLocale = dateLocales[lng] ?? enUS
  const url = `/${lng}/blog/${post.postNumber}/${post.slug}`
  const { coverImage } = post

  return (
    <StyledWrapper data-testid="latest-post-hero">
      {coverImage && (
        <StyledCoverWrapper>
          <BlurUp
            fill
            objectFit={post.coverImageFit ?? 'cover'}
            placeholder={getCldImageUrl({
              src: coverImage,
              ...BLUR_PLACEHOLDER_OPTIONS,
            })}
          >
            {(image) => (
              <CldImage
                src={coverImage}
                alt={post.title}
                fill
                // The cover is the page's largest image (its LCP element).
                preload
                sizes="(max-width: 1440px) 100vw, 1440px"
                {...image}
              />
            )}
          </BlurUp>
        </StyledCoverWrapper>
      )}
      <StyledContent>
        <StyledBadgeRow>
          <StyledCategoryBadge data-testid="category-badge">
            <CategoryIconRenderer slug={post.category} aria-hidden />
            {post.category}
          </StyledCategoryBadge>
          {post.seriesTitle && (
            <StyledSeriesBadge data-testid="series-badge">
              <span>{post.seriesTitle}</span>
              {post.seriesOrder != null && <span>#{post.seriesOrder}</span>}
            </StyledSeriesBadge>
          )}
          {post.tags.map((tag) => (
            <StyledTag key={tag} data-testid="tag">
              {tag}
            </StyledTag>
          ))}
        </StyledBadgeRow>
        <StyledTitle>{post.title}</StyledTitle>
        <StyledExcerpt>{post.excerpt}</StyledExcerpt>
        <StyledMeta>
          <span>{post.author}</span>
          {post.publishedAt && (
            <>
              <StyledMetaSep aria-hidden>|</StyledMetaSep>
              <time dateTime={String(post.publishedAt)}>
                {format(new Date(post.publishedAt), 'PP', {
                  locale: dateLocale,
                })}
              </time>
            </>
          )}
        </StyledMeta>
        <StyledReadMoreLink
          href={url}
          aria-label={`${readMoreLabel} ${post.title}`}
          data-testid="latest-post-hero-link"
        >
          {readMoreLabel}
        </StyledReadMoreLink>
      </StyledContent>
    </StyledWrapper>
  )
}

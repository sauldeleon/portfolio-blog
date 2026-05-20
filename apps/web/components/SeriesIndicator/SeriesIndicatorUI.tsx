'use client'

import {
  StyledCurrentLabel,
  StyledHeading,
  StyledItem,
  StyledLink,
  StyledList,
  StyledOrder,
  StyledPartLabel,
  StyledSection,
} from './SeriesIndicator.styles'

export interface SeriesPost {
  id: string
  postNumber: number
  title: string
  slug: string
  seriesOrder: number | null
}

export interface SeriesIndicatorUIProps {
  posts: SeriesPost[]
  postId: string
  lng: string
  heading: string
  partLabel: string | null
}

export function SeriesIndicatorUI({
  posts,
  postId,
  lng,
  heading,
  partLabel,
}: SeriesIndicatorUIProps) {
  return (
    <StyledSection aria-label={heading}>
      <StyledHeading>{heading}</StyledHeading>
      {partLabel && <StyledPartLabel>{partLabel}</StyledPartLabel>}
      <StyledList>
        {posts.map((post) => {
          const isCurrent = post.id === postId
          return (
            <StyledItem key={post.id} $current={isCurrent}>
              {post.seriesOrder != null && (
                <StyledOrder>{post.seriesOrder}.</StyledOrder>
              )}
              {isCurrent ? (
                <StyledCurrentLabel>{post.title}</StyledCurrentLabel>
              ) : (
                <StyledLink
                  href={`/${lng}/blog/${post.postNumber}/${post.slug}`}
                >
                  {post.title}
                </StyledLink>
              )}
            </StyledItem>
          )
        })}
      </StyledList>
    </StyledSection>
  )
}

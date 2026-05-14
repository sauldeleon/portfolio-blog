'use client'

import type { AdminPost } from '@web/lib/db/queries/posts'

import { PostTable } from '../PostTable'
import { StyledHeader, StyledHeading, StyledPage } from './PostsPageView.styles'

interface PostsPageViewProps {
  posts: AdminPost[]
  title: string
}

export function PostsPageView({ posts, title }: PostsPageViewProps) {
  return (
    <StyledPage data-testid="admin-posts-page">
      <StyledHeader>
        <StyledHeading>{title}</StyledHeading>
      </StyledHeader>
      <PostTable posts={posts} />
    </StyledPage>
  )
}

'use client'

import type { AdminPost } from '@web/lib/db/queries/posts'

import { PostTable } from '../PostTable'
import {
  StyledHeader,
  StyledHeading,
  StyledNewPostLink,
  StyledPage,
} from './PostsPageView.styles'

interface PostsPageViewProps {
  posts: AdminPost[]
  title: string
  newPostLabel: string
}

export function PostsPageView({
  posts,
  title,
  newPostLabel,
}: PostsPageViewProps) {
  return (
    <StyledPage data-testid="admin-posts-page">
      <StyledHeader>
        <StyledHeading>{title}</StyledHeading>
        <StyledNewPostLink href="/admin/posts/new">
          {newPostLabel}
        </StyledNewPostLink>
      </StyledHeader>
      <PostTable posts={posts} />
    </StyledPage>
  )
}

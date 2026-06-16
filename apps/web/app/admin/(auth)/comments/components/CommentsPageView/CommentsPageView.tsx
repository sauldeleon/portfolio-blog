'use client'

import type { CommentRecord } from '@web/lib/db/queries/comments'

import { CommentsTable } from '../CommentsTable'
import {
  StyledHeader,
  StyledHeading,
  StyledPage,
} from './CommentsPageView.styles'

interface CommentsPageViewProps {
  initialComments: CommentRecord[]
  title: string
}

export function CommentsPageView({
  initialComments,
  title,
}: CommentsPageViewProps) {
  return (
    <StyledPage data-testid="admin-comments-page">
      <StyledHeader>
        <StyledHeading>{title}</StyledHeading>
      </StyledHeader>
      <CommentsTable initialComments={initialComments} />
    </StyledPage>
  )
}

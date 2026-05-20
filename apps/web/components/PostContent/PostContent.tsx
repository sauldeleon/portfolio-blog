'use client'

import { StyledArticle } from './PostContent.styles'

export function PostContent({ children }: { children: React.ReactNode }) {
  return <StyledArticle>{children}</StyledArticle>
}

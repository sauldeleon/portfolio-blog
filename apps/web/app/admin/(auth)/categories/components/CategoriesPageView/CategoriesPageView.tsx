'use client'

import type { CategoryForAdmin } from '@web/lib/db/queries/categories'

import { CategoryTable } from '../CategoryTable'
import {
  StyledHeader,
  StyledHeading,
  StyledPage,
} from './CategoriesPageView.styles'

interface CategoriesPageViewProps {
  categories: CategoryForAdmin[]
  title: string
}

export function CategoriesPageView({
  categories,
  title,
}: CategoriesPageViewProps) {
  return (
    <StyledPage data-testid="admin-categories-page">
      <StyledHeader>
        <StyledHeading>{title}</StyledHeading>
      </StyledHeader>
      <CategoryTable categories={categories} />
    </StyledPage>
  )
}

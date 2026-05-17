'use client'

import type { SeriesForAdmin } from '@web/lib/db/queries/series'

import { SeriesTable } from '../SeriesTable'
import {
  StyledHeader,
  StyledHeading,
  StyledPage,
} from './SeriesPageView.styles'

interface SeriesPageViewProps {
  series: SeriesForAdmin[]
  title: string
}

export function SeriesPageView({ series, title }: SeriesPageViewProps) {
  return (
    <StyledPage data-testid="admin-series-page">
      <StyledHeader>
        <StyledHeading>{title}</StyledHeading>
      </StyledHeader>
      <SeriesTable series={series} />
    </StyledPage>
  )
}

'use client'

import { TableOfContents, TocEntry } from '@sdlgr/table-of-contents'

import { StyledNavWrapper } from './ExperiencePage.styles'

interface ExperienceNavProps {
  entries: TocEntry[]
  label: string
}

export function ExperienceNav({ entries, label }: ExperienceNavProps) {
  return (
    <StyledNavWrapper>
      <TableOfContents entries={entries} label={label} />
    </StyledNavWrapper>
  )
}

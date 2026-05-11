'use client'

import React from 'react'

import { StyledHeading } from './ExperiencePage.styles'

export function ExperiencePageTitle({
  children,
}: {
  children: React.ReactNode
}) {
  return <StyledHeading $level={2}>{children}</StyledHeading>
}

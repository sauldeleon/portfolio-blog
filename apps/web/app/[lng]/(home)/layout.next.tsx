'use client'

import React, { useId } from 'react'

import { ArrowRightIcon } from '@sdlgr/assets'
import { Body } from '@sdlgr/typography'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledCircleLink,
  StyledHeading,
  StyledSubHeading,
  StyledSummary,
} from './layout.styles'

interface HomeLayoutProps {
  children: React.ReactNode
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const { t } = useClientTranslation('homepage')
  const summaryParagraphs: string[] = [
    t('summary.p1'),
    t('summary.p2'),
    t('summary.p3'),
  ]
  const id = useId()
  return (
    <>
      <StyledHeading $level={2}>Saúl de León Guerrero</StyledHeading>
      {children}
      <StyledSubHeading as="h2" $level={2}>
        {t('aboutMe')}
      </StyledSubHeading>
      <StyledSummary>
        {summaryParagraphs.map((text, index) => (
          <Body key={`${id}-${index}`}>{text}</Body>
        ))}
      </StyledSummary>
      <StyledCircleLink
        href="/experience"
        iconContent={<ArrowRightIcon />}
        label={t('experience')}
      />
    </>
  )
}

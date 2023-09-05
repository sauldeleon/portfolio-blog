'use client'

import React, { useContext, useId } from 'react'
import { Trans } from 'react-i18next'

import {
  ArrowRightIcon,
  CameraIcon,
  CatIcon,
  GameControllerIcon,
  HikeIcon,
} from '@sdlgr/assets'
import { LanguageContext } from '@sdlgr/i18n-tools'
import { Body, Label } from '@sdlgr/typography'

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
  const { language } = useContext(LanguageContext)
  const summaryParagraphs: React.ReactNode[] = [
    t('summary.p1'),
    t('summary.p2'),
    t('summary.p3'),
    <Trans
      key="summaryP4"
      t={t}
      i18nKey="summary.p4"
      components={{
        hiker: <HikeIcon width={22} height={22} />,
        cat: <CatIcon width={22} height={22} />,
        gameController: <GameControllerIcon width={22} height={22} />,
        camera: <CameraIcon width={22} height={22} />,
      }}
    />,
  ]
  const id = useId()
  return (
    <>
      <StyledHeading $level={2}>Saúl de León Guerrero</StyledHeading>
      <StyledCircleLink
        href={`/${language}/experience`}
        iconContent={<Label $level="XS">{t('explore')}</Label>}
        iconSize={76}
      />
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
        href={`/${language}/experience`}
        iconContent={<ArrowRightIcon />}
        label={t('experience')}
      />
    </>
  )
}

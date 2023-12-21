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
  StyledAttribute,
  StyledAttributeContent,
  StyledAttributes,
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
  const id = useId()

  const attributes = [
    {
      key: 'mountaineer',
      element: (
        <Trans
          key="mountaineer-translate"
          t={t}
          i18nKey="attributes.mountaineer"
          components={{
            icon: <HikeIcon width={22} height={22} />,
          }}
        />
      ),
    },
    {
      key: 'petter',
      element: (
        <Trans
          key="petter-translate"
          t={t}
          i18nKey="attributes.petter"
          components={{
            icon: <CatIcon width={22} height={22} />,
          }}
        />
      ),
    },
    {
      key: 'gamer',
      element: (
        <Trans
          key="gamer-translate"
          t={t}
          i18nKey="attributes.gamer"
          components={{
            icon: <GameControllerIcon width={22} height={22} />,
          }}
        />
      ),
    },
    {
      key: 'photographer',
      element: (
        <Trans
          key="photographer-translate"
          t={t}
          i18nKey="attributes.photographer"
          components={{
            icon: <CameraIcon width={22} height={22} />,
          }}
        />
      ),
    },
  ]

  const summaryParagraphs: React.ReactNode[] = [
    ...t('summary', { returnObjects: true }),
    <StyledAttributes key="attributes">
      {attributes.map(({ key, element }) => (
        <StyledAttribute key={`${key}-attribute`}>
          <StyledAttributeContent>{element}</StyledAttributeContent>
        </StyledAttribute>
      ))}
    </StyledAttributes>,
  ]

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

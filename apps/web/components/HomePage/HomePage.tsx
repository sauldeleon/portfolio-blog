'use client'

import { Body, Label } from '@sdlgr/typography'

import { HomePagePortalGame } from '@web/components/HomePagePortalGame/HomePagePortalGame'
import { Layout } from '@web/components/Layout/Layout'
import { useClientTranslation } from '@web/i18n/client'

import {
  StyledCircleLink,
  StyledHeading,
  StyledSubHeading,
  StyledSummary,
} from './HomePage.styles'

export function HomePage() {
  const { t } = useClientTranslation('homepage')
  const summaryParagraphs: string[] = [
    t('summary.p1'),
    t('summary.p2'),
    t('summary.p3'),
  ]
  return (
    <Layout>
      <StyledHeading $level={2}>Saúl de León Guerrero</StyledHeading>
      <StyledCircleLink
        href="/"
        iconContent={<Label $level="XS">{t('explore')}</Label>}
        iconSize={76}
      />
      <HomePagePortalGame />
      <StyledSubHeading as="h2" $level={1}>
        {t('aboutMe')}
      </StyledSubHeading>
      <StyledSummary>
        {summaryParagraphs.map((text, index) => (
          <Body key={index}>{text}</Body>
        ))}
      </StyledSummary>
    </Layout>
  )
}

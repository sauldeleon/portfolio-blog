'use client'

import { SLLogo } from '@sdlgr/assets'
import { Label } from '@sdlgr/typography'

import { HomePagePortalGame } from '@web/components/HomePagePortalGame/HomePagePortalGame'
import { Layout } from '@web/components/Layout/Layout'
import { useClientTranslation } from '@web/i18n/client'

import {
  StyledCircleLink,
  StyledHeading,
  StyledSubHeading,
} from './HomePage.styles'

export function HomePage() {
  const { t } = useClientTranslation('homepage')
  return (
    <Layout>
      <StyledHeading $level={2}>Saúl de León Guerrero</StyledHeading>
      <StyledCircleLink
        href="/"
        iconContent={<Label $level="XS">{t('explore')}</Label>}
        iconSize={76}
      />
      <HomePagePortalGame />
      <StyledSubHeading as="h2" $level={2}>
        {t('underConstruction')}
      </StyledSubHeading>
      <SLLogo />
    </Layout>
  )
}

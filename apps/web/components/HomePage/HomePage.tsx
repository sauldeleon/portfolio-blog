'use client'

import { SLLogo } from '@sdlgr/assets'
import { CircleLink } from '@sdlgr/circle-link'
import { Label } from '@sdlgr/typography'

import { Layout } from '@web/components/Layout/Layout'
import { useClientTranslation } from '@web/i18n/client'

import { StyledHeading, StyledSubHeading } from './HomePage.styles'

export function HomePage() {
  const { t } = useClientTranslation('homepage')
  return (
    <Layout>
      <StyledHeading $level={2}>Saúl de León Guerrero</StyledHeading>
      <CircleLink
        href="/"
        iconContent={<Label $level="XS">{t('explore')}</Label>}
        iconSize={76}
      />
      <StyledSubHeading as="h2" $level={2}>
        {t('underConstruction')}
      </StyledSubHeading>
      <SLLogo />
    </Layout>
  )
}

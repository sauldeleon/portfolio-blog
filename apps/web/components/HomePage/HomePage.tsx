'use client'

import { SLLogo } from '@sdlgr/assets'

import { Layout } from '@web/components/Layout/Layout'
import { useClientTranslation } from '@web/i18n/client'

import { StyledHeading } from './HomePage.styles'

export function HomePage() {
  const { t } = useClientTranslation()
  return (
    <Layout>
      <StyledHeading>Saúl de León Guerrero</StyledHeading>
      <StyledHeading as="h2" $level={2}>
        {t('underConstruction')}
      </StyledHeading>
      <SLLogo />
    </Layout>
  )
}

'use client'

import { SLLogo } from '@sdlgr/assets'
import { CircleLink } from '@sdlgr/circle-link'
import { Label } from '@sdlgr/typography'

import { Layout } from '@web/components/Layout/Layout'
import { useClientTranslation } from '@web/i18n/client'

import { StyledHeading } from './HomePage.styles'

export function HomePage() {
  const { t } = useClientTranslation()
  return (
    <Layout>
      <StyledHeading>Saúl de León Guerrero</StyledHeading>
      <CircleLink
        href="/"
        iconContent={<Label $level="XS">Explore</Label>}
        iconSize={76}
      />
      <StyledHeading as="h2" $level={2}>
        {t('underConstruction')}
      </StyledHeading>
      <SLLogo />
    </Layout>
  )
}

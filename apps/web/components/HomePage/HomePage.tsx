import { SLLogo } from '@sdlgr/assets'

import { useTranslation } from '@web/i18n/client'

import { Layout } from '../Layout/Layout'
import { StyledHeading } from './HomePage.styles'

export function HomePage() {
  const { t } = useTranslation()
  return (
    <Layout>
      <StyledHeading>Saúl de León Guerrero</StyledHeading>
      <StyledHeading $level={2}>{t('underConstruction')}</StyledHeading>
      <SLLogo />
    </Layout>
  )
}

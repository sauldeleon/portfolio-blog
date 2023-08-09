import { SLLogo } from '@sdlgr/assets'

import { useTranslation } from '@web/i18n/client'

import { StyledHeading, StyledPage } from './HomePage.styles'

export function HomePage({ lng }: { lng: string }) {
  const { t } = useTranslation(lng)
  return (
    <StyledPage>
      <StyledHeading>{t('underConstruction')}</StyledHeading>
      <SLLogo />
    </StyledPage>
  )
}

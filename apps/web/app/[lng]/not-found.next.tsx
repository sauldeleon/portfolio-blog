'use client'

import { Link } from '@sdlgr/link'

import { useClientTranslation } from '@web/i18n/client'

import { Styled404Wrapper, StyledPage } from './not-found.styles'

export function NotFound() {
  const { t } = useClientTranslation('notFound')
  return (
    <StyledPage>
      <Styled404Wrapper title="404">404</Styled404Wrapper>
      <Link href="/">{t('returnHome')}</Link>
    </StyledPage>
  )
}

export default NotFound

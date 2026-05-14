'use client'

import { useClientTranslation } from '@web/i18n/client'

import { LoginForm } from '../LoginForm'
import {
  StyledCard,
  StyledCardHeader,
  StyledPageWrapper,
  StyledSubtitle,
  StyledTitle,
} from './LoginPage.styles'

export function LoginPage() {
  const { t } = useClientTranslation('admin')

  return (
    <StyledPageWrapper data-testid="login-page">
      <StyledCard>
        <StyledCardHeader>
          <StyledTitle>{t('login.title')}</StyledTitle>
          <StyledSubtitle>{t('login.subtitle')}</StyledSubtitle>
        </StyledCardHeader>
        <LoginForm />
      </StyledCard>
    </StyledPageWrapper>
  )
}

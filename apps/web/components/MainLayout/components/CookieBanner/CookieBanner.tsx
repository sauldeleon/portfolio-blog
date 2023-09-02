'use client'

import { useRef } from 'react'
import CookieConsent from 'react-cookie-consent'

import { mainTheme } from '@sdlgr/main-theme'

import { useClientTranslation } from '@web/i18n/client'

import { StyledBody, StyledButton } from './CookieBanner.styles'

export function CookieBanner() {
  const { t } = useClientTranslation()
  const cookieConsentRef = useRef<CookieConsent>(null)

  return (
    <CookieConsent
      cookieName="cookie-consent"
      ref={cookieConsentRef}
      style={{
        background: mainTheme.colors.white,
        fontFamily: mainTheme.fonts.bodyFont,
        alignItems: 'center',
      }}
      acceptOnScroll
      acceptOnScrollPercentage={75}
      ButtonComponent={() => (
        <StyledButton
          aria-label={t('cookieBanner.acceptAria')}
          onClick={() => cookieConsentRef?.current?.accept()}
        >
          <StyledBody>{t('cookieBanner.accept')}</StyledBody>
        </StyledButton>
      )}
    >
      <StyledBody>{t('cookieBanner.message')}</StyledBody>
    </CookieConsent>
  )
}

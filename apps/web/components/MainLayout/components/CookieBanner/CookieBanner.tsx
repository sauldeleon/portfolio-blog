'use client'

import { useRef } from 'react'
import CookieConsent from 'react-cookie-consent'

import { mainTheme } from '@sdlgr/main-theme'
import { Body } from '@sdlgr/typography'

import { useClientTranslation } from '@web/i18n/client'

import { StyledButton } from './CookieBanner.styles'

export function CookieBanner() {
  const { t } = useClientTranslation()
  const cookieConsentRef = useRef<CookieConsent>(null)

  return (
    <CookieConsent
      cookieName="cookie-consent"
      ref={cookieConsentRef}
      style={{
        background: mainTheme.colors.black,
        fontFamily: mainTheme.fonts.bodyFont,
        borderTop: `1px solid ${mainTheme.colors.white}`,
        alignItems: 'center',
      }}
      acceptOnScroll
      acceptOnScrollPercentage={75}
      ButtonComponent={() => (
        <StyledButton
          aria-label={t('cookieBanner.acceptAria')}
          onClick={() => cookieConsentRef?.current?.accept()}
        >
          <Body>{t('cookieBanner.accept')}</Body>
        </StyledButton>
      )}
    >
      <Body>{t('cookieBanner.message')}</Body>
    </CookieConsent>
  )
}

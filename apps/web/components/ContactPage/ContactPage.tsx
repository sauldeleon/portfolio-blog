'use client'

import { useState } from 'react'

import { Link } from '@sdlgr/link'
import { useIsBot } from '@sdlgr/use-is-bot'

import { MainPortal } from '@web/components/MainPortal/MainPortal'
import { NoSSR } from '@web/components/NoSSR/NoSSR'
import { useClientTranslation } from '@web/i18n/client'

import {
  StyledBody,
  StyledContactInfo,
  StyledContactInfoWrapper,
  StyledHeading,
  StyledLabel,
} from './ContactPage.styles'
import { Portrait } from './components/Portrait/Portrait'
import { ToothLessPortrait } from './components/ToothLessPortrait/ToothLessPortrait'

export function ContactPage() {
  const { t } = useClientTranslation('contactPage')
  const [painMode, setPainMode] = useState(false)

  const { isBot, isLoading } = useIsBot()

  const mail = 'sauldeleonguerrero@gmail.com'

  return (
    <MainPortal>
      <StyledContactInfoWrapper>
        <StyledContactInfo $isVisible={!isLoading} data-testid="contact-info">
          <NoSSR>
            {painMode ? (
              <ToothLessPortrait onClick={() => setPainMode(false)} />
            ) : (
              <Portrait onClick={() => setPainMode(true)} />
            )}
          </NoSSR>
          <StyledHeading $level={2}>Software Engineer</StyledHeading>
          <Link
            href="https://www.linkedin.com/in/sauldeleonguerrero"
            aria-label={t('linkedInAria')}
          >
            <StyledBody $level="L">Linked in</StyledBody>
          </Link>
          {!isBot && (
            <NoSSR>
              <StyledBody $level="L">
                <StyledLabel>{t('phone')}:</StyledLabel>{' '}
                <Link href="tel:+34661030038" aria-label={t('phoneAria')}>
                  (+34) 661 03 00 38
                </Link>
              </StyledBody>
              <StyledBody $level="L">
                <StyledLabel>{t('mail')}:</StyledLabel>{' '}
                <Link href={`mailto:${mail}`} aria-label={t('emailAria')}>
                  {mail}
                </Link>
              </StyledBody>
            </NoSSR>
          )}
        </StyledContactInfo>
      </StyledContactInfoWrapper>
    </MainPortal>
  )
}

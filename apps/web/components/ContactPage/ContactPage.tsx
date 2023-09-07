'use client'

import { useState } from 'react'

import { EmailIcon, LinkedInIcon } from '@sdlgr/assets'
import { useIsBot } from '@sdlgr/use-is-bot'

import { MainPortal } from '@web/components/MainPortal/MainPortal'
import { NoSSR } from '@web/components/NoSSR/NoSSR'
import { useClientTranslation } from '@web/i18n/client'

import {
  StyledBody,
  StyledContactInfo,
  StyledContactInfoWrapper,
  StyledHeading,
  StyledIconWrapper,
  StyledLink,
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
          {painMode ? (
            <ToothLessPortrait onClick={() => setPainMode(false)} />
          ) : (
            <Portrait onClick={() => setPainMode(true)} />
          )}
          <StyledHeading $level={2}>Software Engineer</StyledHeading>
          <StyledBody $level="L">
            <StyledIconWrapper>
              <LinkedInIcon />
            </StyledIconWrapper>
            <StyledLink
              href="https://www.linkedin.com/in/sauldeleonguerrero"
              aria-label={t('linkedInAria')}
            >
              LinkedIn
            </StyledLink>
          </StyledBody>
          {!isBot && (
            <NoSSR>
              <StyledBody $level="L">
                <StyledIconWrapper>
                  <EmailIcon />
                </StyledIconWrapper>
                <StyledLink href={`mailto:${mail}`} aria-label={t('emailAria')}>
                  {mail}
                </StyledLink>
              </StyledBody>
            </NoSSR>
          )}
        </StyledContactInfo>
      </StyledContactInfoWrapper>
    </MainPortal>
  )
}

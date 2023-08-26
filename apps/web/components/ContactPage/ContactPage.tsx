'use client'

import { Tooth } from '@sdlgr/assets'
import { Link } from '@sdlgr/link'
import { useIsBot } from '@sdlgr/use-is-bot'

import { NoSSR } from '@web/components/NoSSR/NoSSR'
import { useClientTranslation } from '@web/i18n/client'

import {
  PortraitContainer,
  RotateTooth,
  StyledBody,
  StyledContactInfo,
  StyledContactInfoWrapper,
  StyledHeading,
  StyledLabel,
  StyledMainPortal,
  StyledPortrait,
  StyledPortraitContainer,
  StyledTooth,
  ToothHoleImage,
} from './ContactPage.styles'

export function ContactPage() {
  const { t } = useClientTranslation('contactPage')

  const { isBot, isLoading } = useIsBot()

  const mail = 'sauldeleonguerrero@gmail.com'

  const toothImages = [
    '/assets/toothPlace-1.png',
    '/assets/toothPlace-2.png',
    '/assets/toothPlace-3.png',
    '/assets/toothPlace-4.png',
    '/assets/toothPlace-5.png',
    '/assets/toothPlace-6.png',
    '/assets/toothPlace-7.png',
    '/assets/toothPlace-8.png',
  ]

  return (
    <StyledMainPortal>
      <StyledContactInfoWrapper>
        <StyledContactInfo $isVisible={!isLoading}>
          <PortraitContainer>
            {toothImages.map((_, index) => (
              <StyledTooth key={index} $index={index}>
                <RotateTooth>
                  <Tooth width={10} height={10} />
                </RotateTooth>
              </StyledTooth>
            ))}

            <StyledPortraitContainer>
              <StyledPortrait
                src="/assets/portrait.jpg"
                alt={t('profilePicture')}
                width={140}
                height={140}
              />
              <ToothHoleImage $images={toothImages} />
            </StyledPortraitContainer>
          </PortraitContainer>
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
    </StyledMainPortal>
  )
}

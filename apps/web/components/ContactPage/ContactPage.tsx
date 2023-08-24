import { Link } from '@sdlgr/link'
import { useIsBot } from '@sdlgr/use-is-bot'

import { useClientTranslation } from '@web/i18n/client'

import { NoSSR } from '../NoSSR/NoSSR'
import {
  StyledBody,
  StyledContactInfo,
  StyledContactInfoWrapper,
  StyledHeading,
  StyledLabel,
  StyledMainPortal,
  StyledPortrait,
} from './ContactPage.styles'

export function ContactPage() {
  const { t } = useClientTranslation('contactPage')

  const { isBot, isLoading } = useIsBot()

  const mail = 'sauldeleonguerrero@gmail.com'

  return (
    <StyledMainPortal>
      <StyledContactInfoWrapper>
        <StyledContactInfo $isVisible={!isLoading}>
          <StyledPortrait
            src="/assets/portrait.jpg"
            alt={t('profilePicture')}
            width={140}
            height={140}
          />
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

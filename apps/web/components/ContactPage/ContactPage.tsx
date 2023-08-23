import { Link } from '@sdlgr/link'

import { useClientTranslation } from '@web/i18n/client'

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
  return (
    <StyledMainPortal>
      <StyledContactInfoWrapper>
        <StyledContactInfo>
          <StyledPortrait
            src="/assets/portrait.jpg"
            alt={t('profilePicture')}
            width={140}
            height={140}
          />
          <StyledHeading $level={2}>Software Engineer</StyledHeading>
          <StyledBody $level="L">
            <StyledLabel>{t('phone')}:</StyledLabel>{' '}
            <Link href="tel:+34661030038" aria-label={t('phoneAria')}>
              (+34) 661030038
            </Link>
          </StyledBody>
          <StyledBody $level="L">
            <StyledLabel>{t('mail')}:</StyledLabel>{' '}
            <Link
              href="mailto:sauldeleonguerrero@gmail.com"
              aria-label={t('emailAria')}
            >
              sauldeleonguerrero@gmail.com
            </Link>
          </StyledBody>
          <Link
            href="https://www.linkedin.com/in/sauldeleonguerrero"
            aria-label={t('linkedInAria')}
          >
            <StyledBody $level="L">Linked in</StyledBody>
          </Link>
        </StyledContactInfo>
      </StyledContactInfoWrapper>
    </StyledMainPortal>
  )
}

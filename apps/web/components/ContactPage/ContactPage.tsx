import { Link } from '@sdlgr/link'

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
  return (
    <StyledMainPortal>
      <StyledContactInfoWrapper>
        <StyledContactInfo>
          <StyledPortrait
            src="/assets/portrait.jpg"
            alt="Portrait"
            width={140}
            height={140}
          />
          <StyledHeading $level={2}>Software Engineer</StyledHeading>
          <StyledBody $level="L">
            <StyledLabel>Phone:</StyledLabel>{' '}
            <Link href="tel:+34661030038">(+34) 661030038</Link>
          </StyledBody>
          <StyledBody $level="L">
            <StyledLabel>E-mail:</StyledLabel>{' '}
            <Link href="mailto:sauldeleonguerrero@gmail.com">
              sauldeleonguerrero@gmail.com
            </Link>
          </StyledBody>
          <Link href="https://www.linkedin.com/in/sauldeleonguerrero">
            <StyledBody $level="L">Linked in</StyledBody>
          </Link>
        </StyledContactInfo>
      </StyledContactInfoWrapper>
    </StyledMainPortal>
  )
}

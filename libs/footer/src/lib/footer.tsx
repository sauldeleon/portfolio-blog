import React, { DetailedHTMLProps, HTMLAttributes } from 'react'

import { Body } from '@sdlgr/typography'

import {
  StyledBorderLine,
  StyledFooter,
  StyledInteractiveSection,
  StyledList,
  StyledNav,
  StyledNavLink,
  StyledSLLogo,
  StyledSocialMediaIcons,
  StyledSocialMediaLink,
  StyledTopLines,
} from './footer.styles'

interface FooterProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  navItems?: { label: string; href: string; icon?: React.ReactNode }[]
  socialMediaItems?: { href: string; label: string; icon: React.ReactNode }[]
  navProps?: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
}

export function Footer({
  navItems,
  navProps,
  socialMediaItems,
  ...rest
}: FooterProps) {
  return (
    <StyledFooter {...rest}>
      <StyledTopLines>
        <StyledBorderLine />
        <StyledBorderLine />
        <StyledBorderLine />
      </StyledTopLines>
      <StyledInteractiveSection
        $socialMediaIconsCount={socialMediaItems ? socialMediaItems.length : 0}
      >
        <StyledSLLogo height={64} width={120} />
        <StyledNav {...navProps}>
          {navItems?.length && (
            <StyledList>
              {navItems.map(({ label, href, icon }, index) => (
                <li key={index}>
                  <StyledNavLink href={href}>
                    {icon}
                    <Body>{label}</Body>
                  </StyledNavLink>
                </li>
              ))}
            </StyledList>
          )}
        </StyledNav>
        {socialMediaItems?.length && (
          <StyledSocialMediaIcons>
            {socialMediaItems.map(({ icon, href, label }, index) => (
              <StyledSocialMediaLink key={index} href={href} aria-label={label}>
                {icon}
              </StyledSocialMediaLink>
            ))}
          </StyledSocialMediaIcons>
        )}
      </StyledInteractiveSection>
    </StyledFooter>
  )
}

export default Footer

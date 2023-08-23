import React, { DetailedHTMLProps, HTMLAttributes } from 'react'

import { Button } from '@sdlgr/button'
import { AtLeastOne } from '@sdlgr/global-types'
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

type NavItemShared = {
  label: string
  ariaLabel: string
  icon?: React.ReactNode
}
type NavItemPartial = {
  href: string
  onClick: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
}
type NavItem = AtLeastOne<NavItemPartial> & NavItemShared

interface FooterProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  navItems?: NavItem[]
  socialMediaItems?: {
    href: string
    ariaLabel: string
    icon: React.ReactNode
  }[]
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
              {navItems.map(
                ({ label, ariaLabel, href, icon, onClick }, index) => (
                  <li key={index}>
                    {href ? (
                      <StyledNavLink
                        href={href}
                        aria-label={ariaLabel}
                        onClick={onClick}
                      >
                        {icon}
                        <Body>{label}</Body>
                      </StyledNavLink>
                    ) : (
                      <Button aria-label={ariaLabel} onClick={onClick}>
                        {icon}
                        <Body>{label}</Body>
                      </Button>
                    )}
                  </li>
                )
              )}
            </StyledList>
          )}
        </StyledNav>
        {socialMediaItems?.length && (
          <StyledSocialMediaIcons>
            {socialMediaItems.map(({ icon, href, ariaLabel }, index) => (
              <StyledSocialMediaLink
                key={index}
                href={href}
                aria-label={ariaLabel}
              >
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

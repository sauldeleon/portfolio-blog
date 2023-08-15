import React from 'react'

import { Body } from '@sdlgr/typography'

import {
  StyledList,
  StyledListItem,
  StyledLogoLink,
  StyledNav,
  StyledNavLink,
  StyledSLLogo,
} from './header.styles'

interface HeaderProps {
  items?: { href: string; label: string; hideOnDesktop?: boolean }[]
  actionItem?: React.ReactNode
}

export function Header({ items, actionItem }: HeaderProps) {
  return (
    <StyledNav>
      <StyledLogoLink href="/">
        <StyledSLLogo height={55} />
      </StyledLogoLink>
      {items && items.length && (
        <StyledList>
          {items.map(({ href, label, hideOnDesktop }, index) => (
            <StyledListItem key={index} $hideOnDesktop={hideOnDesktop}>
              <StyledNavLink href={href}>
                <Body>{label}</Body>
              </StyledNavLink>
            </StyledListItem>
          ))}
        </StyledList>
      )}
      {actionItem}
    </StyledNav>
  )
}

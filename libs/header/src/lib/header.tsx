import React, { DetailedHTMLProps, HTMLAttributes } from 'react'

import { Body } from '@sdlgr/typography'

import {
  StyledList,
  StyledListItem,
  StyledNav,
  StyledNavLink,
} from './header.styles'

interface HeaderProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  logo?: React.ReactNode
  navItems?: {
    href: string
    label: string
    ariaLabel: string
    isActive: boolean
    hideOnDesktop?: boolean
  }[]
  actionItem?: React.ReactNode
}

export function Header({ logo, navItems, actionItem, ...rest }: HeaderProps) {
  return (
    <StyledNav {...rest}>
      {logo}
      {navItems?.length && (
        <StyledList>
          {navItems.map(
            ({ href, label, ariaLabel, hideOnDesktop, isActive }, index) => (
              <StyledListItem
                key={index}
                $hideOnDesktop={hideOnDesktop}
                $isActive={isActive}
                aria-current={isActive && 'page'}
              >
                <StyledNavLink
                  href={href}
                  aria-label={ariaLabel}
                  $isActive={isActive}
                >
                  <Body>{label}</Body>
                </StyledNavLink>
              </StyledListItem>
            )
          )}
        </StyledList>
      )}
      {actionItem}
    </StyledNav>
  )
}

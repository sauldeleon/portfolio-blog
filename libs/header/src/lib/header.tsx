import React, { DetailedHTMLProps, HTMLAttributes, useId } from 'react'

import { Body } from '@sdlgr/typography'

import {
  StyledList,
  StyledListItem,
  StyledNav,
  StyledNavLink,
} from './header.styles'

export type NavItem = {
  href: string
  label: string
  ariaLabel: string
  isActive: boolean
  hideOnDesktop?: boolean
}

interface HeaderProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  logo?: React.ReactNode
  navItems?: NavItem[]
  actionItem?: React.ReactNode
}

export function Header({ logo, navItems, actionItem, ...rest }: HeaderProps) {
  const id = useId()
  return (
    <StyledNav {...rest}>
      {logo}
      {navItems?.length && (
        <StyledList>
          {navItems.map(
            ({ href, label, ariaLabel, hideOnDesktop, isActive }, index) => (
              <StyledListItem
                key={`${id}-${index}`}
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
            ),
          )}
        </StyledList>
      )}
      {actionItem}
    </StyledNav>
  )
}

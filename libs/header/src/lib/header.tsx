import Link from 'next/link'
import React from 'react'

import { Body } from '@sdlgr/typography'

import {
  StyledList,
  StyledListItem,
  StyledNav,
  StyledSLLogo,
} from './header.styles'

interface HeaderProps {
  items?: { href: string; label: string; hideOnDesktop?: boolean }[]
  actionItem?: React.ReactNode
}

export function Header({ items, actionItem }: HeaderProps) {
  return (
    <StyledNav>
      <Link href="/">
        <StyledSLLogo height={55} />
      </Link>
      {items && items.length && (
        <StyledList>
          {items.map(({ href, label, hideOnDesktop }, index) => (
            <StyledListItem key={index} $hideOnDesktop={hideOnDesktop}>
              <Link href={href}>
                <Body>{label}</Body>
              </Link>
            </StyledListItem>
          ))}
        </StyledList>
      )}
      {actionItem}
    </StyledNav>
  )
}

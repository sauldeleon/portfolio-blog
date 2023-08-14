import { ArrowRightIcon, SLLogo } from '@sdlgr/assets'
import { CircleLink } from '@sdlgr/circle-link'
import { Body } from '@sdlgr/typography'

import { StyledList, StyledListItem, StyledNav } from './header.styles'

interface HeaderProps {
  items?: { href: string; label: string }[]
  actionButtonLabel: string
}

export function Header({ items, actionButtonLabel }: HeaderProps) {
  return (
    <StyledNav>
      <a href="/">
        <SLLogo height={55} />
      </a>
      {items && items.length && (
        <StyledList>
          {items.map(({ href, label }, index) => (
            <StyledListItem key={index}>
              <a href={href}>
                <Body>{label}</Body>
              </a>
            </StyledListItem>
          ))}
        </StyledList>
      )}
      <CircleLink
        href="/"
        label={actionButtonLabel}
        iconContent={<ArrowRightIcon />}
      />
    </StyledNav>
  )
}

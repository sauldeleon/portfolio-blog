import { LinkProps as NextLinkProps } from 'next/link'
import { AnchorHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react'

import { StyledLink, StyledNextLink } from './link.styles'

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, forceAnchor, prefetch, children, ...props }, forwardedRef) => {
    const isExternalLink =
      href?.startsWith('http') ||
      href?.startsWith('tel') ||
      href?.startsWith('blob') ||
      href?.startsWith('mailto')

    return isExternalLink || Boolean(forceAnchor) ? (
      <StyledLink
        {...props}
        href={href}
        data-testid="plain-anchor"
        target="_blank"
        rel="noreferrer"
        ref={forwardedRef}
      >
        {children}
      </StyledLink>
    ) : (
      <StyledNextLink
        href={href}
        prefetch={prefetch}
        {...props}
        ref={forwardedRef}
      >
        {children}
      </StyledNextLink>
    )
  },
)

export type LinkProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> &
  NextLinkProps & {
    forceAnchor?: boolean
  }

import type { AnchorHTMLAttributes } from 'react'

/** Absolute http(s) or protocol-relative URLs leave the blog. */
export function isExternalHref(href: string | undefined): boolean {
  return /^(https?:)?\/\//i.test(href ?? '')
}

/**
 * Markdown links: external ones open in a new tab, internal ones (paths,
 * anchors) stay in the same tab. An explicit `target` written as HTML wins.
 */
export function PostContentLink({
  href,
  target,
  rel,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = isExternalHref(href)
  return (
    <a
      href={href}
      target={target ?? (external ? '_blank' : undefined)}
      rel={rel ?? (external ? 'noopener noreferrer' : undefined)}
      {...props}
    >
      {children}
    </a>
  )
}

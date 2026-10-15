import { render, screen } from '@testing-library/react'

import { PostContentLink, isExternalHref } from './PostContentLink'

describe('isExternalHref', () => {
  it('detects links leaving the blog', () => {
    expect(isExternalHref('https://a.b')).toBe(true)
    expect(isExternalHref('HTTP://a.b')).toBe(true)
    expect(isExternalHref('//a.b/x')).toBe(true)
    expect(isExternalHref('/es/blog/1/x')).toBe(false)
    expect(isExternalHref('#section')).toBe(false)
    expect(isExternalHref('mailto:me@a.b')).toBe(false)
    expect(isExternalHref(undefined)).toBe(false)
  })
})

describe('PostContentLink', () => {
  it('opens external links in a new tab', () => {
    render(<PostContentLink href="https://a.b">Out</PostContentLink>)
    const link = screen.getByRole('link', { name: 'Out' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('keeps internal links in the same tab', () => {
    render(<PostContentLink href="/es/blog">In</PostContentLink>)
    const link = screen.getByRole('link', { name: 'In' })
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })

  it('respects an explicit target and rel', () => {
    render(
      <PostContentLink href="https://a.b" target="_self" rel="nofollow">
        Same
      </PostContentLink>,
    )
    const link = screen.getByRole('link', { name: 'Same' })
    expect(link).toHaveAttribute('target', '_self')
    expect(link).toHaveAttribute('rel', 'nofollow')
  })
})

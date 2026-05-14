import { render, screen } from '@testing-library/react'

import { BlogImage } from '@sdlgr/blog-image'
import { Callout } from '@sdlgr/callout'

jest.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => (
    <div data-testid="mdx-content">{source}</div>
  ),
}))

jest.mock('@sdlgr/callout', () => ({
  Callout: jest.fn(),
}))

jest.mock('@sdlgr/blog-image', () => ({
  BlogImage: jest.fn(),
}))

describe('renderMDX', () => {
  it('renders the source string', () => {
    const { renderMDX } = require('./renderMDX')
    render(renderMDX('Hello MDX world'))
    expect(screen.getByTestId('mdx-content')).toHaveTextContent(
      'Hello MDX world',
    )
  })

  it('uses Callout in mdxComponents', () => {
    const { mdxComponents } = require('./components')
    expect(mdxComponents.Callout).toBe(Callout)
  })

  it('uses BlogImage in mdxComponents', () => {
    const { mdxComponents } = require('./components')
    expect(mdxComponents.BlogImage).toBe(BlogImage)
  })
})

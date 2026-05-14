import { render, screen } from '@testing-library/react'

import { BlogImage } from '@sdlgr/blog-image'
import { Callout } from '@sdlgr/callout'

jest.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => (
    <div data-testid="mdx-content">{source}</div>
  ),
}))

jest.mock('rehype-pretty-code', () => jest.fn())

jest.mock('./rehypeHeadingIds', () => ({
  rehypeHeadingIds: jest.fn(),
}))

jest.mock('@sdlgr/callout', () => ({
  Callout: jest.fn(),
}))

jest.mock('@sdlgr/blog-image', () => ({
  BlogImage: jest.fn(),
}))

jest.mock('@sdlgr/code-block', () => ({
  CodeBlock: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="code-block">{children}</div>
  ),
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
    const { createMdxComponents } = require('./components')
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    expect(components.Callout).toBe(Callout)
  })

  it('uses BlogImage in mdxComponents', () => {
    const { createMdxComponents } = require('./components')
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    expect(components.BlogImage).toBe(BlogImage)
  })

  it('pre component renders CodeBlock with labels', () => {
    const { createMdxComponents } = require('./components')
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    render(components.pre({ children: <code>const x = 1</code> }))
    expect(screen.getByTestId('code-block')).toBeInTheDocument()
  })

  it('uses default labels when no labels provided', () => {
    const { renderMDX } = require('./renderMDX')
    render(renderMDX('Hello MDX world'))
    expect(screen.getByTestId('mdx-content')).toBeInTheDocument()
  })

  it('uses provided labels when passed', () => {
    const { renderMDX } = require('./renderMDX')
    render(
      renderMDX('Hello MDX world', {
        copyLabel: 'Copiar',
        copiedLabel: '¡Copiado!',
      }),
    )
    expect(screen.getByTestId('mdx-content')).toBeInTheDocument()
  })

  it('exports mdxComponents with default labels', () => {
    const { mdxComponents } = require('./components')
    expect(mdxComponents.Callout).toBe(Callout)
    expect(mdxComponents.BlogImage).toBe(BlogImage)
    expect(mdxComponents.pre).toBeDefined()
  })
})

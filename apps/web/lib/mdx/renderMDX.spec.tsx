import { render, screen } from '@testing-library/react'

import { Callout } from '@sdlgr/callout'

jest.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => (
    <div data-testid="mdx-content">{source}</div>
  ),
}))

jest.mock('rehype-pretty-code', () => jest.fn())
jest.mock('remark-gfm', () => jest.fn())

jest.mock('./rehypeHeadingIds', () => ({
  rehypeHeadingIds: jest.fn(),
}))

jest.mock('./rehypeUnwrapImages', () => ({
  rehypeUnwrapImages: jest.fn(),
}))

jest.mock('./remarkEmbeds', () => ({
  remarkEmbeds: jest.fn(),
}))

jest.mock('@sdlgr/callout', () => ({
  Callout: jest.fn(),
}))

jest.mock('@web/components/PostContent/PostContentImage', () => ({
  PostContentImage: jest.fn(),
}))

jest.mock('@web/components/PostContent/PostContentEmbed', () => ({
  PostContentEmbed: jest.fn(),
}))

jest.mock('@web/components/PostContent/MdxTable', () => ({
  MdxTable: jest.fn(),
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

  it('uses PostContentImage as img in mdxComponents', () => {
    const {
      PostContentImage,
    } = require('@web/components/PostContent/PostContentImage')
    const { createMdxComponents } = require('./components')
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    expect(components.img).toBe(PostContentImage)
  })

  it('uses PostContentEmbed as Embed in mdxComponents', () => {
    const {
      PostContentEmbed,
    } = require('@web/components/PostContent/PostContentEmbed')
    const { createMdxComponents } = require('./components')
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    expect(components.Embed).toBe(PostContentEmbed)
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
    const {
      PostContentImage,
    } = require('@web/components/PostContent/PostContentImage')
    const { mdxComponents } = require('./components')
    expect(mdxComponents.Callout).toBe(Callout)
    expect(mdxComponents.img).toBe(PostContentImage)
    expect(mdxComponents.pre).toBeDefined()
  })

  it('has table component in mdxComponents', () => {
    const { MdxTable } = require('@web/components/PostContent/MdxTable')
    const { createMdxComponents } = require('./components')
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    expect(components.table).toBeDefined()
    render(components.table({ children: null }))
    expect(MdxTable).toHaveBeenCalled()
  })

  it('h1 component renders as h2', () => {
    const { createMdxComponents } = require('./components')
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    render(components.h1({ children: 'Section Title' }))
    const heading = screen.getByRole('heading', { name: 'Section Title' })
    expect(heading.tagName).toBe('H2')
  })
})

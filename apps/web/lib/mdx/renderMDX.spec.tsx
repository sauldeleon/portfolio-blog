import { render, screen } from '@testing-library/react'

import { Callout } from '@sdlgr/callout'

import { MdxTable } from '@web/components/PostContent/MdxTable'
import { PostContentEmbed } from '@web/components/PostContent/PostContentEmbed'
import { PostContentImage } from '@web/components/PostContent/PostContentImage'
import { PostContentLink } from '@web/components/PostContent/PostContentLink'

import { createMdxComponents, mdxComponents } from './components'
import { renderMDX } from './renderMDX'

vi.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => (
    <div data-testid="mdx-content">{source}</div>
  ),
}))

vi.mock('rehype-pretty-code', () => ({ default: vi.fn() }))
vi.mock('remark-gfm', () => ({ default: vi.fn() }))

vi.mock('./rehypeHeadingIds', () => ({
  rehypeHeadingIds: vi.fn(),
}))

vi.mock('./rehypeUnwrapImages', () => ({
  rehypeUnwrapImages: vi.fn(),
}))

vi.mock('./remarkEmbeds', () => ({
  remarkEmbeds: vi.fn(),
}))

vi.mock('@sdlgr/callout', () => ({
  Callout: vi.fn(),
}))

vi.mock('@web/components/PostContent/PostContentImage', () => ({
  PostContentImage: vi.fn(),
}))

vi.mock('@web/components/PostContent/PostContentEmbed', () => ({
  PostContentEmbed: vi.fn(),
}))

vi.mock('@web/components/PostContent/MdxTable', () => ({
  MdxTable: vi.fn(),
}))

vi.mock('@sdlgr/code-block', () => ({
  CodeBlock: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="code-block">{children}</div>
  ),
}))

describe('renderMDX', () => {
  it('renders the source string', async () => {
    render(renderMDX('Hello MDX world'))
    expect(screen.getByTestId('mdx-content')).toHaveTextContent(
      'Hello MDX world',
    )
  })

  it('uses Callout in mdxComponents', async () => {
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    expect(components.Callout).toBe(Callout)
  })

  it('uses PostContentImage as img in mdxComponents', async () => {
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    expect(components.img).toBe(PostContentImage)
  })

  it('uses PostContentLink as a in mdxComponents', async () => {
    expect(mdxComponents.a).toBe(PostContentLink)
  })

  it('uses PostContentEmbed as Embed in mdxComponents', async () => {
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    expect(components.Embed).toBe(PostContentEmbed)
  })

  it('pre component renders CodeBlock with labels', async () => {
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    render(components.pre({ children: <code>const x = 1</code> }))
    expect(screen.getByTestId('code-block')).toBeInTheDocument()
  })

  it('uses default labels when no labels provided', async () => {
    render(renderMDX('Hello MDX world'))
    expect(screen.getByTestId('mdx-content')).toBeInTheDocument()
  })

  it('uses provided labels when passed', async () => {
    render(
      renderMDX('Hello MDX world', {
        copyLabel: 'Copiar',
        copiedLabel: '¡Copiado!',
      }),
    )
    expect(screen.getByTestId('mdx-content')).toBeInTheDocument()
  })

  it('exports mdxComponents with default labels', async () => {
    expect(mdxComponents.Callout).toBe(Callout)
    expect(mdxComponents.img).toBe(PostContentImage)
    expect(mdxComponents.pre).toBeDefined()
  })

  it('has table component in mdxComponents', async () => {
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    expect(components.table).toBeDefined()
    render(components.table({ children: null }))
    expect(MdxTable).toHaveBeenCalled()
  })

  it('h1 component renders as h2', async () => {
    const components = createMdxComponents({
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    })
    render(components.h1({ children: 'Section Title' }))
    const heading = screen.getByRole('heading', { name: 'Section Title' })
    expect(heading.tagName).toBe('H2')
  })
})

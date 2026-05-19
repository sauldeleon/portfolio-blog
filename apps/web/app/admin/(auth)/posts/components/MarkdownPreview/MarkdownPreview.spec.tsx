import { act, render, screen } from '@testing-library/react'

import { RenderProviders, renderApp } from '@sdlgr/test-utils'

import { MarkdownPreview } from './MarkdownPreview'

const mockSerializePreview = jest.fn()

jest.mock('../../actions/serializePreview', () => ({
  serializePreview: (...args: unknown[]) => mockSerializePreview(...args),
}))

jest.mock('@sdlgr/code-block', () => ({
  CodeBlock: ({
    children,
    'data-language': language,
  }: {
    children?: React.ReactNode
    'data-language'?: string
  }) => (
    <div data-testid="code-block">
      {language && <span data-testid="code-lang">{language}</span>}
      <pre>{children}</pre>
    </div>
  ),
}))

jest.mock('@web/components/PostContent/PostContentImage', () => ({
  PostContentImage: ({ src, alt }: { src?: string; alt?: string }) =>
    src ? <img src={src} alt={alt ?? ''} /> : null,
}))

jest.mock('@web/components/PostContent/PostContentEmbed', () => ({
  PostContentEmbed: ({ type, url }: { type?: string; url?: string }) =>
    url ? (
      <div data-testid="embed-wrapper">
        <iframe src={url} title={type ?? 'embed'} />
      </div>
    ) : null,
}))

jest.mock('@web/components/PostContent/MdxTable', () => ({
  MdxTable: ({ children }: { children?: React.ReactNode }) => (
    <table data-testid="mdx-table">{children}</table>
  ),
}))

jest.mock('next-mdx-remote', () => ({
  MDXRemote: ({
    compiledSource,
    components,
  }: {
    compiledSource: string
    components?: {
      pre?: React.ElementType<React.HTMLAttributes<HTMLPreElement>>
      img?: React.ElementType<React.ImgHTMLAttributes<HTMLImageElement>>
      Embed?: React.ElementType<{ type?: string; url?: string }>
      h1?: React.ElementType<React.HTMLAttributes<HTMLHeadingElement>>
      table?: React.ElementType<React.HTMLAttributes<HTMLTableElement>>
    }
  }) => {
    const Pre = components?.pre
    const Img = components?.img
    const EmbedComp = components?.Embed
    const H1 = components?.h1
    const Table = components?.table
    return (
      <div data-testid="mdx-content">
        {compiledSource}
        {Pre && (
          <Pre data-language="tsx">
            <code>const x = 1</code>
          </Pre>
        )}
        {Img && <Img src="https://picsum.photos/id/11/800/400" alt="test" />}
        {EmbedComp && (
          <EmbedComp type="youtube" url="https://www.youtube.com/embed/abc" />
        )}
        {H1 && <H1>Markdown H1 Heading</H1>}
        {Table && (
          <Table>
            <tbody>
              <tr>
                <td>cell</td>
              </tr>
            </tbody>
          </Table>
        )}
      </div>
    )
  },
}))

const fakeSerialized = {
  compiledSource: 'compiled-source',
  scope: {},
  frontmatter: {},
}

describe('MarkdownPreview', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockSerializePreview.mockResolvedValue(fakeSerialized)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders nothing when content is empty', () => {
    const { container } = renderApp(
      <MarkdownPreview content="" loadingLabel="Rendering…" />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when content is only whitespace', () => {
    const { container } = renderApp(
      <MarkdownPreview content="   " loadingLabel="Rendering…" />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows loading state while debouncing', () => {
    renderApp(<MarkdownPreview content="# Hello" loadingLabel="Rendering…" />)
    expect(screen.getByTestId('preview-loading')).toHaveTextContent(
      'Rendering…',
    )
  })

  it('renders preview after debounce resolves', async () => {
    renderApp(<MarkdownPreview content="# Hello" loadingLabel="Rendering…" />)
    await act(async () => {
      jest.advanceTimersByTime(500)
      await Promise.resolve()
    })
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
    expect(screen.getByTestId('mdx-content')).toBeInTheDocument()
  })

  it('calls serializePreview with the content', async () => {
    renderApp(
      <MarkdownPreview content="# Hello world" loadingLabel="Rendering…" />,
    )
    await act(async () => {
      jest.advanceTimersByTime(500)
      await Promise.resolve()
    })
    expect(mockSerializePreview).toHaveBeenCalledWith('# Hello world')
  })

  it('clears serialized state when content becomes empty', async () => {
    const { rerender } = renderApp(
      <MarkdownPreview content="# Hello" loadingLabel="Rendering…" />,
    )
    await act(async () => {
      jest.advanceTimersByTime(500)
      await Promise.resolve()
    })
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()

    rerender(<MarkdownPreview content="" loadingLabel="Rendering…" />)
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument()
    expect(screen.queryByTestId('preview-loading')).not.toBeInTheDocument()
  })

  it('debounces: does not call serialize before 500ms', () => {
    renderApp(<MarkdownPreview content="# Hello" loadingLabel="Rendering…" />)
    jest.advanceTimersByTime(499)
    expect(mockSerializePreview).not.toHaveBeenCalled()
  })

  it('cancels previous timer when content changes', async () => {
    const { rerender } = render(
      <MarkdownPreview content="# Hello" loadingLabel="Rendering…" />,
      { wrapper: RenderProviders },
    )
    jest.advanceTimersByTime(400)
    rerender(<MarkdownPreview content="# Updated" loadingLabel="Rendering…" />)
    jest.advanceTimersByTime(400)
    expect(mockSerializePreview).not.toHaveBeenCalled()
    await act(async () => {
      jest.advanceTimersByTime(200)
      await Promise.resolve()
    })
    expect(mockSerializePreview).toHaveBeenCalledTimes(1)
    expect(mockSerializePreview).toHaveBeenCalledWith('# Updated')
  })

  it('hides loading and shows nothing on serialization error', async () => {
    mockSerializePreview.mockRejectedValue(new Error('parse error'))
    renderApp(
      <MarkdownPreview content="bad mdx {{{" loadingLabel="Rendering…" />,
    )
    await act(async () => {
      jest.advanceTimersByTime(500)
      await Promise.resolve()
    })
    expect(screen.queryByTestId('preview-loading')).not.toBeInTheDocument()
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument()
  })

  it('renders CodeBlock for pre elements with language label', async () => {
    renderApp(<MarkdownPreview content="# Hello" loadingLabel="Rendering…" />)
    await act(async () => {
      jest.advanceTimersByTime(500)
      await Promise.resolve()
    })
    expect(screen.getByTestId('code-block')).toBeInTheDocument()
    expect(screen.getByTestId('code-lang')).toHaveTextContent('tsx')
  })

  it('renders Embed component when present in compiled MDX', async () => {
    renderApp(<MarkdownPreview content="# Hello" loadingLabel="Rendering…" />)
    await act(async () => {
      jest.advanceTimersByTime(500)
      await Promise.resolve()
    })
    expect(screen.getByTestId('embed-wrapper')).toBeInTheDocument()
  })

  it('renders h1 as h2', async () => {
    renderApp(<MarkdownPreview content="# Hello" loadingLabel="Rendering…" />)
    await act(async () => {
      jest.advanceTimersByTime(500)
      await Promise.resolve()
    })
    const heading = screen.getByRole('heading', { name: 'Markdown H1 Heading' })
    expect(heading.tagName).toBe('H2')
  })

  it('renders MdxTable for table elements', async () => {
    renderApp(<MarkdownPreview content="# Hello" loadingLabel="Rendering…" />)
    await act(async () => {
      jest.advanceTimersByTime(500)
      await Promise.resolve()
    })
    expect(screen.getByTestId('mdx-table')).toBeInTheDocument()
  })
})

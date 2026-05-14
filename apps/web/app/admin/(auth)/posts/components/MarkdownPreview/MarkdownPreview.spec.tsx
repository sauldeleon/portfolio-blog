import { act, fireEvent, render, screen } from '@testing-library/react'

import { RenderProviders, renderApp } from '@sdlgr/test-utils'

import {
  CopyCodeBlock,
  CustomImage,
  Embed,
  MarkdownPreview,
} from './MarkdownPreview'

const mockSerializePreview = jest.fn()

jest.mock('../../actions/serializePreview', () => ({
  serializePreview: (...args: unknown[]) => mockSerializePreview(...args),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
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
    }
  }) => {
    const Pre = components?.pre
    const Img = components?.img
    const EmbedComp = components?.Embed
    return (
      <div data-testid="mdx-content">
        {compiledSource}
        {Pre && (
          <Pre>
            <code>const x = 1</code>
          </Pre>
        )}
        {Img && <Img src="https://picsum.photos/id/11/800/400" alt="test" />}
        {EmbedComp && (
          <EmbedComp type="youtube" url="https://www.youtube.com/embed/abc" />
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

  it('renders Embed component when present in compiled MDX', async () => {
    renderApp(<MarkdownPreview content="# Hello" loadingLabel="Rendering…" />)
    await act(async () => {
      jest.advanceTimersByTime(500)
      await Promise.resolve()
    })
    expect(screen.getByTestId('embed-wrapper')).toBeInTheDocument()
  })
})

describe('CopyCodeBlock', () => {
  const mockWriteText = jest.fn()

  beforeEach(() => {
    jest.useFakeTimers()
    mockWriteText.mockReset()
    mockWriteText.mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockWriteText } })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders children inside a pre element with a Copy button', () => {
    renderApp(
      <CopyCodeBlock>
        <code>const x = 1</code>
      </CopyCodeBlock>,
    )
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    expect(screen.getByText('const x = 1')).toBeInTheDocument()
  })

  it('copies code text to clipboard on click', async () => {
    renderApp(
      <CopyCodeBlock>
        <code>const x = 1</code>
      </CopyCodeBlock>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(mockWriteText).toHaveBeenCalledWith('const x = 1')
    await act(async () => {
      await Promise.resolve()
    })
  })

  it('falls back to empty string when pre has no text content', async () => {
    renderApp(<CopyCodeBlock />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(mockWriteText).toHaveBeenCalledWith('')
    await act(async () => {
      await Promise.resolve()
    })
  })

  it('shows Copied! immediately after click', async () => {
    renderApp(
      <CopyCodeBlock>
        <code>const x = 1</code>
      </CopyCodeBlock>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByRole('button')).toHaveTextContent('Copied!')
  })

  it('reverts button label to Copy after 2000ms', async () => {
    renderApp(
      <CopyCodeBlock>
        <code>const x = 1</code>
      </CopyCodeBlock>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByRole('button')).toHaveTextContent('Copied!')

    await act(async () => {
      jest.advanceTimersByTime(2000)
    })
    expect(screen.getByRole('button')).toHaveTextContent('Copy')
  })
})

describe('CustomImage', () => {
  it('renders nothing when src is not provided', () => {
    const { container } = renderApp(<CustomImage />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders image with empty alt when alt is not provided', () => {
    renderApp(<CustomImage src="https://picsum.photos/id/11/800/400" />)
    expect(screen.getByAltText('')).toBeInTheDocument()
  })

  it('uses plain alt text as-is when no params present', () => {
    renderApp(
      <CustomImage src="https://picsum.photos/id/11/800/400" alt="A dog" />,
    )
    expect(screen.getByRole('img', { name: 'A dog' })).toBeInTheDocument()
  })

  it('renders with size=small and empty alt when no alt param', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="size=small"
      />,
    )
    expect(screen.getByAltText('')).toBeInTheDocument()
  })

  it('renders with size=medium', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="size=medium"
      />,
    )
    expect(screen.getByAltText('')).toBeInTheDocument()
  })

  it('renders with align=left', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="size=small&align=left"
      />,
    )
    expect(screen.getByAltText('')).toBeInTheDocument()
  })

  it('renders with align=right', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="size=small&align=right"
      />,
    )
    expect(screen.getByAltText('')).toBeInTheDocument()
  })

  it('extracts clean alt text from alt param', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="size=small&alt=My photo"
      />,
    )
    expect(screen.getByRole('img', { name: 'My photo' })).toBeInTheDocument()
  })

  it('renders caption below image by default', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="caption=Photo by Unsplash&alt=A forest"
      />,
    )
    const caption = screen.getByText('Photo by Unsplash')
    const img = screen.getByRole('img', { name: 'A forest' })
    expect(caption).toBeInTheDocument()
    expect(
      img.compareDocumentPosition(caption) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('renders caption above image when caption-pos=top', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="caption=Photo by Unsplash&caption-pos=top&alt=A forest"
      />,
    )
    const caption = screen.getByText('Photo by Unsplash')
    const img = screen.getByRole('img', { name: 'A forest' })
    expect(caption).toBeInTheDocument()
    expect(
      img.compareDocumentPosition(caption) & Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy()
  })

  it('does not open modal when expand param is absent', () => {
    renderApp(
      <CustomImage src="https://picsum.photos/id/11/800/400" alt="A dog" />,
    )
    fireEvent.click(screen.getByTestId('image-wrapper'))
    expect(screen.queryByTestId('image-modal')).not.toBeInTheDocument()
  })

  it('opens modal when expand=true and image wrapper is clicked', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="expand=true&alt=A dog"
      />,
    )
    expect(screen.queryByTestId('image-modal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('image-wrapper'))
    expect(screen.getByTestId('image-modal')).toBeInTheDocument()
  })

  it('closes modal when overlay is clicked', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="expand=true&alt=A dog"
      />,
    )
    fireEvent.click(screen.getByTestId('image-wrapper'))
    fireEvent.click(screen.getByTestId('image-modal'))
    expect(screen.queryByTestId('image-modal')).not.toBeInTheDocument()
  })

  it('closes modal when close button is clicked', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="expand=true&alt=A dog"
      />,
    )
    fireEvent.click(screen.getByTestId('image-wrapper'))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('image-modal')).not.toBeInTheDocument()
  })

  it('stops propagation on modal content click so overlay does not close', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="expand=true&alt=A dog"
      />,
    )
    fireEvent.click(screen.getByTestId('image-wrapper'))
    const images = screen.getAllByRole('img')
    fireEvent.click(images[1])
    expect(screen.getByTestId('image-modal')).toBeInTheDocument()
  })

  it('shows caption in modal when caption is present', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="expand=true&caption=Forest road&alt=A forest"
      />,
    )
    fireEvent.click(screen.getByTestId('image-wrapper'))
    const captions = screen.getAllByText('Forest road')
    expect(captions.length).toBeGreaterThan(1)
  })

  it('shows open original link in modal', () => {
    renderApp(
      <CustomImage
        src="https://picsum.photos/id/11/800/400"
        alt="expand=true&alt=A dog"
      />,
    )
    fireEvent.click(screen.getByTestId('image-wrapper'))
    expect(screen.getByRole('link', { name: 'Open original' })).toHaveAttribute(
      'href',
      'https://picsum.photos/id/11/800/400',
    )
  })
})

describe('Embed', () => {
  it('renders nothing when url is not provided', () => {
    const { container } = renderApp(<Embed />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders iframe with given url', () => {
    renderApp(<Embed type="youtube" url="https://www.youtube.com/embed/abc" />)
    const iframe = screen.getByTitle('youtube')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abc')
  })

  it('uses embed as fallback title when type is not provided', () => {
    renderApp(<Embed url="https://example.com" />)
    expect(screen.getByTitle('embed')).toBeInTheDocument()
  })

  it('renders embed-wrapper test id', () => {
    renderApp(<Embed type="maps" url="https://maps.example.com" />)
    expect(screen.getByTestId('embed-wrapper')).toBeInTheDocument()
  })
})

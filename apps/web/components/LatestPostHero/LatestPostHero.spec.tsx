import { render, screen } from '@testing-library/react'

jest.mock('@sdlgr/post-hero', () => ({
  PostHero: ({
    title,
    author,
    publishedAt,
    readingTime,
    url,
  }: {
    title: string
    author: string
    publishedAt: string | null
    readingTime: number
    url?: string
  }) => (
    <div data-testid="post-hero-mock">
      <span data-testid="hero-title">{title}</span>
      <span data-testid="hero-author">{author}</span>
      <span data-testid="hero-published">{publishedAt}</span>
      <span data-testid="hero-reading-time">{readingTime}</span>
      <span data-testid="hero-url">{url}</span>
    </div>
  ),
}))

jest.mock('@web/utils/computeReadingTime', () => ({
  computeReadingTime: (content: string) => content.split(' ').length,
}))

const { LatestPostHero } =
  require('./LatestPostHero') as typeof import('./LatestPostHero')

const mockPost = {
  id: 'post1',
  postNumber: 5,
  slug: 'my-post',
  title: 'My Post Title',
  excerpt: 'An excerpt',
  content: 'Hello world content here',
  author: 'Saúl',
  publishedAt: new Date('2024-06-01T00:00:00.000Z'),
  updatedAt: new Date('2024-06-01T00:00:00.000Z'),
  createdAt: new Date('2024-06-01T00:00:00.000Z'),
  category: 'engineering',
  tags: ['react'],
  coverImage: 'cover/img',
  coverImageFit: 'cover' as const,
  seriesId: null,
  seriesOrder: null,
  seriesTitle: null,
  status: 'published' as const,
}

describe('LatestPostHero', () => {
  it('renders the PostHero with post data', () => {
    render(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByTestId('post-hero-mock')).toBeInTheDocument()
    expect(screen.getByTestId('hero-title')).toHaveTextContent('My Post Title')
    expect(screen.getByTestId('hero-author')).toHaveTextContent('Saúl')
  })

  it('renders the read more link pointing to the post URL', () => {
    render(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    const link = screen.getByTestId('latest-post-hero-link')
    expect(link).toHaveAttribute('href', '/en/blog/5/my-post')
    expect(link).toHaveTextContent('Read more →')
  })

  it('passes the url to PostHero', () => {
    render(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByTestId('hero-url')).toHaveTextContent(
      '/en/blog/5/my-post',
    )
  })

  it('formats publishedAt date for the active locale', () => {
    render(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByTestId('hero-published')).toHaveTextContent(
      'Jun 1, 2024',
    )
  })

  it('formats publishedAt date for es locale', () => {
    render(
      <LatestPostHero post={mockPost} lng="es" readMoreLabel="Leer más →" />,
    )
    expect(screen.getByTestId('hero-published')).toHaveTextContent('1 jun 2024')
  })

  it('renders null publishedAt as null in PostHero', () => {
    render(
      <LatestPostHero
        post={{ ...mockPost, publishedAt: null }}
        lng="en"
        readMoreLabel="Read more →"
      />,
    )
    expect(screen.getByTestId('hero-published')).toBeEmptyDOMElement()
  })

  it('computes reading time from content', () => {
    render(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    // "Hello world content here" = 4 words
    expect(screen.getByTestId('hero-reading-time')).toHaveTextContent('4')
  })

  it('falls back to enUS for unknown locale', () => {
    render(
      <LatestPostHero
        post={mockPost}
        lng={'fr' as 'en'}
        readMoreLabel="Read more →"
      />,
    )
    expect(screen.getByTestId('hero-published')).toHaveTextContent(
      'Jun 1, 2024',
    )
  })
})

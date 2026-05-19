import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { PostCard } from './PostCard'

const defaultProps = {
  id: '01JWTEST000000000000000000',
  postNumber: 1,
  slug: 'test-post',
  title: 'Test Post Title',
  excerpt: 'This is an excerpt.',
  author: 'admin',
  publishedAt: 'Jan 1, 2024',
  readingTime: 5,
  category: 'engineering',
  tags: ['react', 'typescript', 'nextjs'],
  coverImagePublicId: null,
  lng: 'en',
  readMoreLabel: 'Read more',
}

describe('PostCard', () => {
  it('renders title', () => {
    renderWithTheme(<PostCard {...defaultProps} />)
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('renders excerpt', () => {
    renderWithTheme(<PostCard {...defaultProps} />)
    expect(screen.getByText('This is an excerpt.')).toBeInTheDocument()
  })

  it('renders category', () => {
    renderWithTheme(<PostCard {...defaultProps} />)
    expect(screen.getByText('engineering')).toBeInTheDocument()
  })

  it('renders author', () => {
    renderWithTheme(<PostCard {...defaultProps} />)
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('renders published date', () => {
    renderWithTheme(<PostCard {...defaultProps} />)
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument()
  })

  it('renders reading time', () => {
    renderWithTheme(<PostCard {...defaultProps} />)
    expect(screen.getByText('5 min')).toBeInTheDocument()
  })

  it('renders max 3 tags and overflow badge', () => {
    renderWithTheme(
      <PostCard {...defaultProps} tags={['a', 'b', 'c', 'd', 'e']} />,
    )
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('c')).toBeInTheDocument()
    expect(screen.queryByText('d')).toBeNull()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('does not render overflow badge when tags <= 3', () => {
    renderWithTheme(<PostCard {...defaultProps} tags={['a', 'b', 'c']} />)
    expect(screen.queryByText(/^\+/)).toBeNull()
  })

  it('renders cover image when coverImagePublicId provided', () => {
    renderWithTheme(
      <PostCard {...defaultProps} coverImagePublicId="blog/img" />,
    )
    expect(screen.getByAltText('Test Post Title')).toBeInTheDocument()
  })

  it('renders placeholder when no cover image', () => {
    renderWithTheme(<PostCard {...defaultProps} />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders with coverImageFit contain without errors', () => {
    renderWithTheme(
      <PostCard
        {...defaultProps}
        coverImagePublicId="blog/img"
        coverImageFit="contain"
      />,
    )
    expect(screen.getByAltText('Test Post Title')).toBeInTheDocument()
  })

  it('renders read more link with correct href', () => {
    renderWithTheme(<PostCard {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'Read more' })).toHaveAttribute(
      'href',
      '/en/blog/1/test-post',
    )
  })

  it('renders read more link with href="#" when postNumber is undefined', () => {
    renderWithTheme(<PostCard {...defaultProps} postNumber={undefined} />)
    expect(screen.getByRole('link', { name: 'Read more' })).toHaveAttribute(
      'href',
      '#',
    )
  })

  it('does not render date when publishedAt is null', () => {
    renderWithTheme(<PostCard {...defaultProps} publishedAt={null} />)
    expect(screen.queryByRole('time')).toBeNull()
  })

  it('renders series badge when seriesTitle provided', () => {
    renderWithTheme(
      <PostCard {...defaultProps} seriesTitle="React Series" seriesOrder={2} />,
    )
    expect(screen.getByTestId('series-badge')).toBeInTheDocument()
    expect(screen.getByText('React Series')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
  })

  it('does not render series badge when seriesTitle is null', () => {
    renderWithTheme(<PostCard {...defaultProps} seriesTitle={null} />)
    expect(screen.queryByTestId('series-badge')).not.toBeInTheDocument()
  })

  it('does not render series badge when seriesTitle is undefined', () => {
    renderWithTheme(<PostCard {...defaultProps} />)
    expect(screen.queryByTestId('series-badge')).not.toBeInTheDocument()
  })

  it('renders series badge without order when seriesOrder is null', () => {
    renderWithTheme(
      <PostCard
        {...defaultProps}
        seriesTitle="React Series"
        seriesOrder={null}
      />,
    )
    expect(screen.getByTestId('series-badge')).toBeInTheDocument()
    expect(screen.getByText('React Series')).toBeInTheDocument()
    expect(screen.queryByText(/#\d/)).not.toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { baseElement } = renderWithTheme(
      <PostCard {...defaultProps} coverImagePublicId="blog/cover" />,
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('matches snapshot with series badge', () => {
    const { baseElement } = renderWithTheme(
      <PostCard
        {...defaultProps}
        coverImagePublicId="blog/cover"
        seriesTitle="React Series"
        seriesOrder={2}
      />,
    )
    expect(baseElement).toMatchSnapshot()
  })
})

import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { PostHero } from './PostHero'

jest.mock('./ShareButtons', () => ({
  ShareButtons: ({ url }: { url: string }) => (
    <div data-testid="share-buttons" data-url={url} />
  ),
}))

const defaultProps = {
  title: 'My Post Title',
  coverImagePublicId: 'blog/cover-image',
  category: 'Technology',
  author: 'John Doe',
  publishedAt: 'Jan 1, 2024',
  readingTime: 5,
  lng: 'en',
}

describe('PostHero', () => {
  it('renders title', () => {
    renderWithTheme(<PostHero {...defaultProps} />)
    expect(
      screen.getByRole('heading', { name: 'My Post Title' }),
    ).toBeInTheDocument()
  })

  it('renders cover image when coverImagePublicId is provided', () => {
    renderWithTheme(<PostHero {...defaultProps} />)
    const img = screen.getByAltText('My Post Title')
    expect(img).toBeInTheDocument()
  })

  it('renders no cover image when coverImagePublicId is null', () => {
    renderWithTheme(<PostHero {...defaultProps} coverImagePublicId={null} />)
    expect(screen.queryByAltText('My Post Title')).not.toBeInTheDocument()
  })

  it('renders date when publishedAt is provided', () => {
    renderWithTheme(<PostHero {...defaultProps} />)
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument()
  })

  it('does not render date when publishedAt is null', () => {
    renderWithTheme(<PostHero {...defaultProps} publishedAt={null} />)
    expect(screen.queryByText('Jan 1, 2024')).not.toBeInTheDocument()
    expect(screen.queryByRole('time')).not.toBeInTheDocument()
  })

  it('renders reading time', () => {
    renderWithTheme(<PostHero {...defaultProps} />)
    expect(screen.getByTestId('reading-time')).toHaveTextContent('5 min')
  })

  it('renders category', () => {
    renderWithTheme(<PostHero {...defaultProps} />)
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('renders author', () => {
    renderWithTheme(<PostHero {...defaultProps} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders tags when provided', () => {
    renderWithTheme(<PostHero {...defaultProps} tags={['react', 'nextjs']} />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('nextjs')).toBeInTheDocument()
  })

  it('renders no tags when empty', () => {
    renderWithTheme(<PostHero {...defaultProps} tags={[]} />)
    expect(screen.queryAllByTestId('tag')).toHaveLength(0)
  })

  it('renders series badge when seriesTitle is provided', () => {
    renderWithTheme(
      <PostHero {...defaultProps} seriesTitle="My Series" seriesOrder={2} />,
    )
    expect(screen.getByTestId('series-badge')).toBeInTheDocument()
    expect(screen.getByText('My Series')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
  })

  it('renders series badge without order when seriesOrder is null', () => {
    renderWithTheme(
      <PostHero {...defaultProps} seriesTitle="My Series" seriesOrder={null} />,
    )
    expect(screen.getByTestId('series-badge')).toBeInTheDocument()
    expect(screen.queryByText(/#\d/)).not.toBeInTheDocument()
  })

  it('does not render series badge when seriesTitle is null', () => {
    renderWithTheme(<PostHero {...defaultProps} seriesTitle={null} />)
    expect(screen.queryByTestId('series-badge')).not.toBeInTheDocument()
  })

  it('does not render series badge when seriesTitle is not provided', () => {
    renderWithTheme(<PostHero {...defaultProps} />)
    expect(screen.queryByTestId('series-badge')).not.toBeInTheDocument()
  })

  it('renders share buttons when url is provided', () => {
    renderWithTheme(
      <PostHero {...defaultProps} url="https://example.com/post" />,
    )
    expect(screen.getByTestId('share-buttons')).toBeInTheDocument()
  })

  it('does not render share buttons when url is not provided', () => {
    renderWithTheme(<PostHero {...defaultProps} />)
    expect(screen.queryByTestId('share-buttons')).not.toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { baseElement } = renderWithTheme(<PostHero {...defaultProps} />)
    expect(baseElement).toMatchSnapshot()
  })
})

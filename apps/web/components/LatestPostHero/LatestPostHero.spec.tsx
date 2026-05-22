import { screen } from '@testing-library/react'
import React from 'react'

import { renderWithTheme } from '@sdlgr/test-utils'

jest.mock('next-cloudinary', () => ({
  CldImage: ({ alt, style }: { alt: string; style?: React.CSSProperties }) => (
    <img data-testid="cover-image" alt={alt} style={style} />
  ),
}))

jest.mock('@web/utils/categoryIcons', () => ({
  CategoryIconRenderer: ({
    slug: _slug,
    ...props
  }: { slug: string } & React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="category-icon" {...props} />
  ),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const { LatestPostHero } =
  require('./LatestPostHero') as typeof import('./LatestPostHero')

const mockPost = {
  id: 'post1',
  postNumber: 5,
  slug: 'my-post',
  title: 'My Post Title',
  excerpt: 'An excerpt about the post',
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
  it('renders the wrapper', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByTestId('latest-post-hero')).toBeInTheDocument()
  })

  it('renders cover image when coverImage is set', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByTestId('cover-image')).toBeInTheDocument()
    expect(screen.getByTestId('cover-image')).toHaveAttribute(
      'alt',
      'My Post Title',
    )
  })

  it('passes objectFit cover when coverImageFit is null', () => {
    renderWithTheme(
      <LatestPostHero
        post={{ ...mockPost, coverImageFit: null }}
        lng="en"
        readMoreLabel="Read more →"
      />,
    )
    expect(screen.getByTestId('cover-image')).toHaveStyle({
      objectFit: 'cover',
    })
  })

  it('passes objectFit through when coverImageFit is set', () => {
    renderWithTheme(
      <LatestPostHero
        post={{ ...mockPost, coverImageFit: 'contain' }}
        lng="en"
        readMoreLabel="Read more →"
      />,
    )
    expect(screen.getByTestId('cover-image')).toHaveStyle({
      objectFit: 'contain',
    })
  })

  it('does not render cover image when coverImage is null', () => {
    renderWithTheme(
      <LatestPostHero
        post={{ ...mockPost, coverImage: null }}
        lng="en"
        readMoreLabel="Read more →"
      />,
    )
    expect(screen.queryByTestId('cover-image')).toBeNull()
  })

  it('renders the category badge', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByTestId('category-badge')).toBeInTheDocument()
    expect(screen.getByTestId('category-badge')).toHaveTextContent(
      'engineering',
    )
  })

  it('renders the category icon', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByTestId('category-icon')).toBeInTheDocument()
  })

  it('renders series badge with order when seriesTitle and seriesOrder are set', () => {
    renderWithTheme(
      <LatestPostHero
        post={{ ...mockPost, seriesTitle: 'My Series', seriesOrder: 2 }}
        lng="en"
        readMoreLabel="Read more →"
      />,
    )
    expect(screen.getByTestId('series-badge')).toBeInTheDocument()
    expect(screen.getByText('My Series')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
  })

  it('does not render series order when seriesOrder is null', () => {
    renderWithTheme(
      <LatestPostHero
        post={{ ...mockPost, seriesTitle: 'My Series', seriesOrder: null }}
        lng="en"
        readMoreLabel="Read more →"
      />,
    )
    expect(screen.getByTestId('series-badge')).toBeInTheDocument()
    expect(screen.queryByText(/^#/)).toBeNull()
  })

  it('does not render series badge when seriesTitle is null', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.queryByTestId('series-badge')).toBeNull()
  })

  it('renders tags when present', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByText('react')).toBeInTheDocument()
  })

  it('does not render tags when empty', () => {
    renderWithTheme(
      <LatestPostHero
        post={{ ...mockPost, tags: [] }}
        lng="en"
        readMoreLabel="Read more →"
      />,
    )
    expect(screen.queryAllByTestId('tag')).toHaveLength(0)
  })

  it('renders the title as h2', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'My Post Title',
    )
  })

  it('renders the excerpt', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByText('An excerpt about the post')).toBeInTheDocument()
  })

  it('renders the author', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByText('Saúl')).toBeInTheDocument()
  })

  it('formats publishedAt for en locale', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    expect(screen.getByText('Jun 1, 2024')).toBeInTheDocument()
  })

  it('formats publishedAt for es locale', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="es" readMoreLabel="Leer más →" />,
    )
    expect(screen.getByText('1 jun 2024')).toBeInTheDocument()
  })

  it('does not render date when publishedAt is null', () => {
    renderWithTheme(
      <LatestPostHero
        post={{ ...mockPost, publishedAt: null }}
        lng="en"
        readMoreLabel="Read more →"
      />,
    )
    expect(screen.queryByRole('time')).toBeNull()
  })

  it('renders the read more link pointing to the post URL', () => {
    renderWithTheme(
      <LatestPostHero post={mockPost} lng="en" readMoreLabel="Read more →" />,
    )
    const link = screen.getByTestId('latest-post-hero-link')
    expect(link).toHaveAttribute('href', '/en/blog/5/my-post')
    expect(link).toHaveTextContent('Read more →')
  })

  it('falls back to enUS for unknown locale', () => {
    renderWithTheme(
      <LatestPostHero
        post={mockPost}
        lng={'fr' as 'en'}
        readMoreLabel="Read more →"
      />,
    )
    expect(screen.getByText('Jun 1, 2024')).toBeInTheDocument()
  })
})

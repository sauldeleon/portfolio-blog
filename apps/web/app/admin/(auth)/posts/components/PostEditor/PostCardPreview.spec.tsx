import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { PostCardPreview } from './PostCardPreview'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const map: Record<string, string> = {
        'postEditor.cardPreview': 'Card preview',
      }
      return map[key] ?? key
    },
  }),
}))

jest.mock('@sdlgr/post-card', () => ({
  PostCard: (props: Record<string, unknown>) => (
    <div
      data-testid="post-card"
      data-title={props.title}
      data-slug={props.slug}
      data-excerpt={props.excerpt}
      data-author={props.author}
      data-published-at={props.publishedAt}
      data-reading-time={props.readingTime}
      data-category={props.category}
      data-cover={props.coverImagePublicId}
      data-cover-fit={props.coverImageFit}
      data-lng={props.lng}
    />
  ),
}))

jest.mock('@web/utils/computeReadingTime', () => ({
  computeReadingTime: jest.fn().mockReturnValue(3),
}))

const defaultProps = {
  title: 'My Post',
  slug: 'my-post',
  excerpt: 'An excerpt',
  content: 'Some content here',
  categoryName: 'Engineering',
  tags: ['react', 'nextjs'],
  coverImage: 'blog/cover-img',
  author: 'Saúl de León',
  lng: 'en',
}

describe('PostCardPreview', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-15'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('renders the preview wrapper', () => {
    renderApp(<PostCardPreview {...defaultProps} />)
    expect(screen.getByTestId('post-card-preview')).toBeInTheDocument()
  })

  it('shows the card preview label', () => {
    renderApp(<PostCardPreview {...defaultProps} />)
    expect(screen.getByText('Card preview')).toBeInTheDocument()
  })

  it('passes title, slug, excerpt, author, category, lng to PostCard', () => {
    renderApp(<PostCardPreview {...defaultProps} />)
    const card = screen.getByTestId('post-card')
    expect(card).toHaveAttribute('data-title', 'My Post')
    expect(card).toHaveAttribute('data-slug', 'my-post')
    expect(card).toHaveAttribute('data-excerpt', 'An excerpt')
    expect(card).toHaveAttribute('data-author', 'Saúl de León')
    expect(card).toHaveAttribute('data-category', 'Engineering')
    expect(card).toHaveAttribute('data-lng', 'en')
  })

  it('passes computed reading time to PostCard', () => {
    renderApp(<PostCardPreview {...defaultProps} />)
    expect(screen.getByTestId('post-card')).toHaveAttribute(
      'data-reading-time',
      '3',
    )
  })

  it('passes today as publishedAt', () => {
    renderApp(<PostCardPreview {...defaultProps} />)
    expect(screen.getByTestId('post-card')).toHaveAttribute(
      'data-published-at',
      new Date('2026-01-15').toLocaleDateString(),
    )
  })

  it('passes coverImagePublicId when coverImage is set', () => {
    renderApp(<PostCardPreview {...defaultProps} coverImage="blog/cover-img" />)
    expect(screen.getByTestId('post-card')).toHaveAttribute(
      'data-cover',
      'blog/cover-img',
    )
  })

  it('passes null coverImagePublicId when coverImage is empty', () => {
    renderApp(<PostCardPreview {...defaultProps} coverImage="" />)
    expect(screen.getByTestId('post-card')).not.toHaveAttribute('data-cover')
  })

  it('passes coverImageFit to PostCard when provided', () => {
    renderApp(<PostCardPreview {...defaultProps} coverImageFit="contain" />)
    expect(screen.getByTestId('post-card')).toHaveAttribute(
      'data-cover-fit',
      'contain',
    )
  })

  it('does not pass coverImageFit when not provided', () => {
    renderApp(<PostCardPreview {...defaultProps} />)
    expect(screen.getByTestId('post-card')).not.toHaveAttribute(
      'data-cover-fit',
    )
  })
})

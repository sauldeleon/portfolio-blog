import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { PostHero } from './PostHero'

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

  it('renders placeholder when no cover image', () => {
    renderWithTheme(<PostHero {...defaultProps} coverImagePublicId={null} />)
    expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument()
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

  it('matches snapshot', () => {
    const { baseElement } = renderWithTheme(<PostHero {...defaultProps} />)
    expect(baseElement).toMatchSnapshot()
  })
})

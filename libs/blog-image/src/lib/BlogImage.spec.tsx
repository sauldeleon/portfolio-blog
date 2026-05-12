import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { BlogImage } from './BlogImage'

describe('BlogImage', () => {
  it('renders image with src and alt', () => {
    renderWithTheme(<BlogImage src="blog/my-image" alt="A photo" />)
    expect(screen.getByAltText('A photo')).toBeInTheDocument()
  })

  it('renders caption when provided', () => {
    renderWithTheme(<BlogImage src="blog/img" alt="img" caption="My caption" />)
    expect(screen.getByText('My caption')).toBeInTheDocument()
  })

  it('does not render caption when omitted', () => {
    renderWithTheme(<BlogImage src="blog/img" alt="img" />)
    expect(screen.getByRole('figure')).not.toHaveTextContent(/./)
  })

  it('renders position full', () => {
    renderWithTheme(<BlogImage src="blog/img" alt="img" position="full" />)
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })

  it('renders position center (default)', () => {
    renderWithTheme(<BlogImage src="blog/img" alt="img" />)
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })

  it('renders position left', () => {
    renderWithTheme(<BlogImage src="blog/img" alt="img" position="left" />)
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })

  it('renders position right', () => {
    renderWithTheme(<BlogImage src="blog/img" alt="img" position="right" />)
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })

  it('passes custom width and height', () => {
    renderWithTheme(
      <BlogImage src="blog/img" alt="img" width={400} height={300} />,
    )
    const img = screen.getByAltText('img') as HTMLImageElement
    expect(img).toHaveAttribute('width', '400')
    expect(img).toHaveAttribute('height', '300')
  })

  it('matches snapshot', () => {
    const { baseElement } = renderWithTheme(
      <BlogImage
        src="blog/my-image"
        alt="A photo"
        position="center"
        caption="Caption text"
        width={800}
        height={600}
      />,
    )
    expect(baseElement).toMatchSnapshot()
  })
})

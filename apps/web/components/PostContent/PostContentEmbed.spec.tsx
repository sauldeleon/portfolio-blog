import { render, screen } from '@testing-library/react'

import { PostContentEmbed } from './PostContentEmbed'

jest.mock('./PostContent.styles', () => ({
  StyledEmbedWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="post-embed-wrapper">{children}</div>
  ),
}))

describe('PostContentEmbed', () => {
  it('returns null when url is not provided', () => {
    const { container } = render(<PostContentEmbed />)
    expect(container).toBeEmptyDOMElement()
  })

  it('returns null when url is undefined', () => {
    const { container } = render(<PostContentEmbed url={undefined} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders iframe with provided url', () => {
    render(<PostContentEmbed url="https://www.youtube.com/embed/abc" />)
    expect(screen.getByTestId('post-embed-wrapper')).toBeInTheDocument()
    const iframe = screen.getByTitle('embed')
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abc')
  })

  it('uses type as iframe title when provided', () => {
    render(<PostContentEmbed url="https://maps.example.com/embed" type="map" />)
    expect(screen.getByTitle('map')).toBeInTheDocument()
  })

  it('falls back to "embed" title when type is not provided', () => {
    render(<PostContentEmbed url="https://example.com/embed" />)
    expect(screen.getByTitle('embed')).toBeInTheDocument()
  })

  it('renders with allowFullScreen on iframe', () => {
    render(<PostContentEmbed url="https://example.com/embed" />)
    const iframe = screen.getByTitle('embed')
    expect(iframe).toHaveAttribute('allowFullScreen')
  })
})

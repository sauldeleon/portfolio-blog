import { render, screen } from '@testing-library/react'

import { OgImageTemplate } from './OgImageTemplate'

describe('OgImageTemplate', () => {
  it('renders with title', () => {
    render(<OgImageTemplate title="My Post Title" />)
    expect(screen.getByText('My Post Title')).toBeInTheDocument()
  })

  it('always renders the domain', () => {
    render(<OgImageTemplate title="Test" />)
    expect(screen.getByText('sawl.dev')).toBeInTheDocument()
  })

  it('renders cover image when cover is provided', () => {
    render(
      <OgImageTemplate title="Test" cover="https://example.com/cover.jpg" />,
    )
    const img = screen.getByTestId('og-cover')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg')
  })

  it('does not render image when cover is not provided', () => {
    render(<OgImageTemplate title="Test" />)
    expect(screen.queryByTestId('og-cover')).not.toBeInTheDocument()
  })

  it('does not render image when cover is null', () => {
    render(<OgImageTemplate title="Test" cover={null} />)
    expect(screen.queryByTestId('og-cover')).not.toBeInTheDocument()
  })

  it('renders category badge when category is provided', () => {
    render(<OgImageTemplate title="Test" category="Engineering" />)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
  })

  it('does not render category badge when category is not provided', () => {
    render(<OgImageTemplate title="Test" />)
    expect(screen.queryByText('Engineering')).not.toBeInTheDocument()
  })

  it('does not render category badge when category is null', () => {
    render(<OgImageTemplate title="Test" category={null} />)
    expect(
      screen.queryByRole('generic', { name: /category/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('null')).not.toBeInTheDocument()
  })

  it('uses gradient background when no cover', () => {
    render(<OgImageTemplate title="Test" />)
    const wrapper = screen.getByTestId('og-wrapper')
    expect(wrapper.style.background).toContain('gradient')
  })

  it('uses transparent background when cover is provided', () => {
    render(<OgImageTemplate title="Test" cover="https://example.com/img.jpg" />)
    const wrapper = screen.getByTestId('og-wrapper')
    expect(wrapper.style.background).toBe('transparent')
  })
})

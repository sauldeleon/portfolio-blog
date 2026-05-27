import { render, screen } from '@testing-library/react'

import { PostContentEmbed } from './PostContentEmbed'

jest.mock('./PostContent.styles', () => ({
  StyledEmbedWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="post-embed-wrapper">{children}</div>
  ),
}))

jest.mock('@sdlgr/gpx-map', () => ({
  GpxMap: ({
    url,
    showWaypoints,
  }: {
    url: string
    showWaypoints?: boolean
  }) => (
    <div
      data-testid="gpx-map"
      data-url={url}
      data-show-waypoints={String(showWaypoints ?? false)}
    />
  ),
}))

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    let Component: React.ComponentType<unknown> = () => null
    fn().then((mod) => {
      Component = mod.default
    })
    const DynamicComponent = (props: unknown) => (
      <Component {...(props as object)} />
    )
    return DynamicComponent
  },
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

  it('renders GpxMap when type is gpx', async () => {
    render(<PostContentEmbed type="gpx" url="https://example.com/track.gpx" />)
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toBeInTheDocument()
    expect(gpxMap).toHaveAttribute('data-url', 'https://example.com/track.gpx')
  })

  it('does not render iframe when type is gpx', async () => {
    render(<PostContentEmbed type="gpx" url="https://example.com/track.gpx" />)
    await screen.findByTestId('gpx-map')
    expect(screen.queryByTestId('post-embed-wrapper')).not.toBeInTheDocument()
  })

  it('passes showWaypoints=true to GpxMap when prop is set', async () => {
    render(
      <PostContentEmbed
        type="gpx"
        url="https://example.com/track.gpx"
        showWaypoints={true}
      />,
    )
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toHaveAttribute('data-show-waypoints', 'true')
  })

  it('passes showWaypoints=false to GpxMap when prop is not set', async () => {
    render(<PostContentEmbed type="gpx" url="https://example.com/track.gpx" />)
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toHaveAttribute('data-show-waypoints', 'false')
  })
})

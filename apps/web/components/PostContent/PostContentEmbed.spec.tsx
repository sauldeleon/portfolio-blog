import { render, screen } from '@testing-library/react'

import { PostContentEmbed } from './PostContentEmbed'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'gpxMap.downloadGpx': 'Download GPX',
        'gpxMap.waypoints': 'Waypoints',
        'gpxMap.colName': 'Name',
        'gpxMap.colCoordinates': 'Coordinates',
        'gpxMap.colElevation': 'Elevation',
        'gpxMap.flyTo': 'View on map',
        'embed.watchOnYouTube': 'Watch on YouTube',
        'embed.360info': '360 info text',
      }
      return map[key] ?? key
    },
  }),
}))

jest.mock('./PostContent.styles', () => ({
  StyledEmbedWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="post-embed-wrapper">{children}</div>
  ),
  StyledEmbed360Wrapper: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  StyledEmbed360Thumbnail: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      src={src}
      alt={alt}
      data-testid="post-embed-360-thumbnail"
      {...props}
    />
  ),
  StyledEmbed360Overlay: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  StyledEmbed360Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  StyledEmbed360Info: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  StyledEmbed360Link: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} data-testid="post-embed-360-link" {...props}>
      {children}
    </a>
  ),
}))

jest.mock('@sdlgr/gpx-map', () => ({
  GpxMap: ({
    url,
    tracks,
    showWaypoints,
    allowDownload,
    waypointImages,
    downloadLabel,
    labels,
  }: {
    url?: string
    tracks?: Array<{ url: string; name?: string; color?: string }>
    showWaypoints?: boolean
    allowDownload?: boolean
    waypointImages?: Record<string, string>
    downloadLabel?: string
    labels?: Record<string, string>
  }) => (
    <div
      data-testid="gpx-map"
      data-url={url ?? ''}
      data-tracks={tracks ? JSON.stringify(tracks) : ''}
      data-show-waypoints={String(showWaypoints ?? false)}
      data-allow-download={String(allowDownload ?? false)}
      data-waypoint-images={
        waypointImages ? JSON.stringify(waypointImages) : ''
      }
      data-download-label={downloadLabel ?? ''}
      data-fly-to-label={labels?.flyTo ?? ''}
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

  it('renders GpxMap when type is gpx with url', async () => {
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

  it('passes allowDownload=true to GpxMap when prop is set', async () => {
    render(
      <PostContentEmbed
        type="gpx"
        url="https://example.com/track.gpx"
        allowDownload={true}
      />,
    )
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toHaveAttribute('data-allow-download', 'true')
  })

  it('passes allowDownload=false to GpxMap when prop is not set', async () => {
    render(<PostContentEmbed type="gpx" url="https://example.com/track.gpx" />)
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toHaveAttribute('data-allow-download', 'false')
  })

  it('passes parsed waypointImages to GpxMap when json string provided', async () => {
    const images = { Summit: 'https://cdn.com/img.jpg' }
    render(
      <PostContentEmbed
        type="gpx"
        url="https://example.com/track.gpx"
        waypointImages={JSON.stringify(images)}
      />,
    )
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toHaveAttribute(
      'data-waypoint-images',
      JSON.stringify(images),
    )
  })

  it('passes undefined waypointImages to GpxMap when prop not set', async () => {
    render(<PostContentEmbed type="gpx" url="https://example.com/track.gpx" />)
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toHaveAttribute('data-waypoint-images', '')
  })

  it('passes translated downloadLabel to GpxMap', async () => {
    render(<PostContentEmbed type="gpx" url="https://example.com/track.gpx" />)
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toHaveAttribute('data-download-label', 'Download GPX')
  })

  it('passes translated flyTo label to GpxMap', async () => {
    render(<PostContentEmbed type="gpx" url="https://example.com/track.gpx" />)
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toHaveAttribute('data-fly-to-label', 'View on map')
  })

  it('renders GpxMap with tracks when tracks json string provided', async () => {
    const tracks = [
      { url: 'https://cdn.com/t1.gpx', name: 'Outbound', color: '#e63946' },
      { url: 'https://cdn.com/t2.gpx', name: 'Return', color: '#3a86ff' },
    ]
    render(<PostContentEmbed type="gpx" tracks={JSON.stringify(tracks)} />)
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toHaveAttribute('data-tracks', JSON.stringify(tracks))
    expect(gpxMap).toHaveAttribute('data-url', '')
  })

  it('returns null for gpx type when neither url nor tracks provided', () => {
    const { container } = render(<PostContentEmbed type="gpx" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('passes tracks and waypointImages together', async () => {
    const tracks = [{ url: 'https://cdn.com/t1.gpx' }]
    const images = { Summit: 'https://cdn.com/img.jpg' }
    render(
      <PostContentEmbed
        type="gpx"
        tracks={JSON.stringify(tracks)}
        waypointImages={JSON.stringify(images)}
      />,
    )
    const gpxMap = await screen.findByTestId('gpx-map')
    expect(gpxMap).toHaveAttribute('data-tracks', JSON.stringify(tracks))
    expect(gpxMap).toHaveAttribute(
      'data-waypoint-images',
      JSON.stringify(images),
    )
  })

  it('renders 360 card with thumbnail and watch link for youtube-360 type', () => {
    render(
      <PostContentEmbed
        type="youtube-360"
        url="https://www.youtube.com/embed/abc123"
      />,
    )
    expect(screen.getByTestId('post-embed-360-wrapper')).toBeInTheDocument()
    const thumbnail = screen.getByTestId('post-embed-360-thumbnail')
    expect(thumbnail).toHaveAttribute(
      'src',
      'https://img.youtube.com/vi/abc123/hqdefault.jpg',
    )
    const link = screen.getByTestId('post-embed-360-link')
    expect(link).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=abc123',
    )
    expect(link).toHaveTextContent('Watch on YouTube')
    expect(screen.getByText('360 info text')).toBeInTheDocument()
  })

  it('renders 360 card without thumbnail when url has no youtube video id', () => {
    render(
      <PostContentEmbed
        type="youtube-360"
        url="https://example.com/not-youtube"
      />,
    )
    expect(screen.getByTestId('post-embed-360-wrapper')).toBeInTheDocument()
    expect(
      screen.queryByTestId('post-embed-360-thumbnail'),
    ).not.toBeInTheDocument()
    const link = screen.getByTestId('post-embed-360-link')
    expect(link).toHaveAttribute('href', 'https://example.com/not-youtube')
  })
})

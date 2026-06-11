import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import React from 'react'
import { useMap } from 'react-leaflet'

import {
  GpxMap,
  GpxTrackDef,
  parseElevationFromXml,
  parseWaypointsFromXml,
} from './GpxMap'

jest.mock('leaflet/dist/leaflet.css', () => ({}))
jest.mock('leaflet-gpx', () => ({}))

jest.mock('recharts', () => ({
  AreaChart: ({
    children,
    data,
    onMouseMove,
    onMouseLeave,
  }: {
    children: React.ReactNode
    data?: Array<{ lat: number; lon: number; [key: string]: unknown }>
    onMouseMove?: (state: {
      activeTooltipIndex: string | null | undefined
    }) => void
    onMouseLeave?: () => void
  }) => (
    <div data-testid="area-chart">
      <button
        data-testid="area-chart-trigger-hover"
        onClick={() => {
          if (onMouseMove && data?.length) {
            onMouseMove({ activeTooltipIndex: '0' })
          }
        }}
      />
      <button
        data-testid="area-chart-trigger-hover-no-index"
        onClick={() => onMouseMove?.({ activeTooltipIndex: null })}
      />
      <button
        data-testid="area-chart-trigger-hover-oob"
        onClick={() => onMouseMove?.({ activeTooltipIndex: '9999' })}
      />
      <button
        data-testid="area-chart-trigger-leave"
        onClick={() => onMouseLeave?.()}
      />
      {children}
    </div>
  ),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

jest.mock('leaflet', () => {
  const on = jest.fn()
  const addTo = jest.fn()
  const getBounds = jest.fn().mockReturnValue({ _bounds: true })
  const eachLayer = jest.fn()
  const GPX = jest
    .fn()
    .mockImplementation(() => ({ on, addTo, getBounds, eachLayer }))
  const IconDefault = {
    prototype: {},
    mergeOptions: jest.fn(),
  }
  return {
    __esModule: true,
    default: { GPX, Icon: { Default: IconDefault } },
    GPX,
    Icon: { Default: IconDefault },
    _testMocks: { on, addTo, getBounds, eachLayer, GPX },
  }
})

jest.mock('react-leaflet', () => ({
  MapContainer: ({
    children,
    scrollWheelZoom,
  }: {
    children: React.ReactNode
    scrollWheelZoom: boolean
  }) => (
    <div
      data-testid="map-container"
      data-scroll-wheel-zoom={String(scrollWheelZoom)}
    >
      {children}
    </div>
  ),
  TileLayer: ({ attribution, url }: { attribution: string; url: string }) => (
    <div
      data-testid="tile-layer"
      data-attribution={attribution}
      data-url={url}
    />
  ),
  AttributionControl: () => null,
  CircleMarker: ({
    center,
    radius,
    pathOptions,
    'data-testid': testId,
  }: {
    center: [number, number]
    radius: number
    pathOptions?: { color?: string }
    'data-testid'?: string
  }) => (
    <div
      data-testid={testId ?? 'circle-marker'}
      data-center={JSON.stringify(center)}
      data-radius={radius}
      data-color={pathOptions?.color}
    />
  ),
  useMap: jest.fn(),
}))

jest.mock('./GpxMap.styles', () => ({
  StyledGpxMap: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="gpx-map-wrapper">{children}</div>
  ),
  StyledElevationChart: ({
    children,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    'data-testid'?: string
  }) => <div data-testid={testId ?? 'elevation-chart'}>{children}</div>,
  StyledElevationLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="elevation-label">{children}</div>
  ),

  StyledMapContainer: require('react').forwardRef(
    (
      { children }: { children: React.ReactNode },
      ref: React.Ref<HTMLDivElement>,
    ) => (
      <div ref={ref} data-testid="map-container-wrapper">
        {children}
      </div>
    ),
  ),
  StyledRowChevron: ({
    children,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    $expanded: boolean
    'data-testid'?: string
  }) => <span data-testid={testId}>{children}</span>,
  StyledWaypointImageCard: ({
    src,
    alt,
    'data-testid': testId,
  }: {
    src: string
    alt: string
    'data-testid'?: string
  }) => <img data-testid={testId} src={src} alt={alt} />,
  StyledWaypointsDetails: ({ children }: { children: React.ReactNode }) => (
    <details data-testid="waypoints-details">{children}</details>
  ),
  StyledTableWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="table-wrapper">{children}</div>
  ),
  StyledLocateButton: ({
    children,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    onClick: React.MouseEventHandler
    'aria-label': string
  }) => (
    <button aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  ),
  StyledDownloadBar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="download-bar">{children}</div>
  ),
  StyledDownloadButton: ({
    children,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    onClick: React.MouseEventHandler
    'aria-label': string
  }) => (
    <button aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  ),
  StyledTrackStrip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="track-strip">{children}</div>
  ),
  StyledTrackChip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="track-chip">{children}</div>
  ),
  StyledTrackDot: ({
    $color,
    $active,
  }: {
    $color: string
    $active: boolean
  }) => (
    <span
      data-testid="track-dot"
      data-color={$color}
      data-active={String($active)}
    />
  ),
  StyledTrackToggle: ({
    children,
    onClick,
    'aria-pressed': ariaPressed,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    onClick: React.MouseEventHandler
    'aria-pressed': boolean
    'data-testid'?: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed}
      data-testid={testId}
    >
      {children}
    </button>
  ),
  StyledTrackDownloadButton: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    onClick: React.MouseEventHandler
    'aria-label': string
    'data-testid'?: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {children}
    </button>
  ),
  StyledLayerSwitcher: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layer-switcher">{children}</div>
  ),
  StyledLayerButton: ({
    children,
    onClick,
    $active: _active,
    'aria-pressed': ariaPressed,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    onClick: React.MouseEventHandler
    $active: boolean
    'aria-pressed': boolean
    'data-testid'?: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed}
      data-testid={testId}
    >
      {children}
    </button>
  ),
}))

const L = require('leaflet')
const { _testMocks } = L
const {
  on: mockOn,
  addTo: mockAddTo,
  getBounds: mockGetBounds,
  eachLayer: mockEachLayer,
  GPX: MockGPX,
} = _testMocks

const GPX_URL = 'https://example.com/track.gpx'

const GPX_XML_WITH_WAYPOINTS = `<?xml version="1.0"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="43.5" lon="-5.6">
    <name>Refugio Mar</name>
    <desc>Mountain refuge</desc>
    <ele>1200.5</ele>
    <sym>Campground</sym>
  </wpt>
  <wpt lat="43.6" lon="-5.7">
    <name>Summit</name>
    <ele>1500</ele>
    <sym>Summit</sym>
  </wpt>
</gpx>`

const GPX_XML_NO_WAYPOINTS = `<?xml version="1.0"?><gpx xmlns="http://www.topografix.com/GPX/1/1"></gpx>`

const GPX_XML_WITH_TRKPTS = `<?xml version="1.0"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <trkseg>
      <trkpt lat="43.5" lon="-5.6"><ele>100</ele></trkpt>
      <trkpt lat="43.51" lon="-5.61"><ele>110</ele></trkpt>
      <trkpt lat="43.52" lon="-5.62"><ele>120</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`

describe('GpxMap', () => {
  const mockFitBounds = jest.fn()
  const mockRemoveLayer = jest.fn()
  const mockFlyTo = jest.fn()
  const mockSetMaxZoom = jest.fn()

  beforeEach(() => {
    mockFitBounds.mockReset()
    mockRemoveLayer.mockReset()
    mockFlyTo.mockReset()
    mockSetMaxZoom.mockReset()
    MockGPX.mockClear()
    mockOn.mockClear()
    mockAddTo.mockClear()
    mockGetBounds.mockReset()
    mockGetBounds.mockReturnValue({ _bounds: true })
    mockEachLayer.mockReset()
    window.HTMLElement.prototype.scrollIntoView = jest.fn()
    ;(useMap as jest.Mock).mockReturnValue({
      fitBounds: mockFitBounds,
      removeLayer: mockRemoveLayer,
      flyTo: mockFlyTo,
      setMaxZoom: mockSetMaxZoom,
    })
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(GPX_XML_WITH_WAYPOINTS),
    } as unknown as Response)
  })

  it('renders gpx map wrapper', () => {
    render(<GpxMap url={GPX_URL} />)
    expect(screen.getByTestId('gpx-map-wrapper')).toBeInTheDocument()
  })

  it('renders map container wrapper', () => {
    render(<GpxMap url={GPX_URL} />)
    expect(screen.getByTestId('map-container-wrapper')).toBeInTheDocument()
  })

  it('renders map container', () => {
    render(<GpxMap url={GPX_URL} />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('enables scroll wheel zoom', () => {
    render(<GpxMap url={GPX_URL} />)
    expect(screen.getByTestId('map-container')).toHaveAttribute(
      'data-scroll-wheel-zoom',
      'true',
    )
  })

  it('renders tile layer with OpenStreetMap', () => {
    render(<GpxMap url={GPX_URL} />)
    const tile = screen.getByTestId('tile-layer')
    expect(tile).toHaveAttribute(
      'data-attribution',
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    )
    expect(tile).toHaveAttribute(
      'data-url',
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    )
  })

  it('creates GPX layer with correct url and options', () => {
    render(<GpxMap url={GPX_URL} />)
    expect(MockGPX).toHaveBeenCalledWith(GPX_URL, {
      async: true,
      polyline_options: { color: '#e63946', weight: 3, opacity: 0.85 },
      marker_options: expect.objectContaining({
        shadowUrl: expect.stringContaining('data:image/gif'),
        iconSize: [20, 26],
        iconAnchor: [10, 26],
        shadowSize: [0, 0],
      }),
      markers: expect.objectContaining({
        startIcon: expect.stringContaining('data:image/svg+xml'),
        endIcon: expect.stringContaining('data:image/svg+xml'),
        wptIcons: expect.objectContaining({
          '': expect.stringContaining('data:image/svg+xml'),
          Warning: expect.stringContaining('data:image/svg+xml'),
          Summit: expect.stringContaining('data:image/svg+xml'),
        }),
      }),
    })
  })

  it('registers loaded event on GPX layer', () => {
    render(<GpxMap url={GPX_URL} />)
    expect(mockOn).toHaveBeenCalledWith('loaded', expect.any(Function))
  })

  it('adds GPX layer to map', () => {
    render(<GpxMap url={GPX_URL} />)
    expect(mockAddTo).toHaveBeenCalled()
  })

  it('fits bounds on loaded event', () => {
    render(<GpxMap url={GPX_URL} />)
    const loadedCallback = mockOn.mock.calls.find(
      (c: [string, () => void]) => c[0] === 'loaded',
    )?.[1]
    act(() => {
      loadedCallback()
    })
    expect(mockFitBounds).toHaveBeenCalledWith({ _bounds: true })
  })

  it('removes layer on unmount', () => {
    const { unmount } = render(<GpxMap url={GPX_URL} />)
    unmount()
    expect(mockRemoveLayer).toHaveBeenCalled()
  })

  it('recreates GPX layer when url changes', () => {
    const { rerender } = render(<GpxMap url="https://example.com/track1.gpx" />)
    rerender(<GpxMap url="https://example.com/track2.gpx" />)
    expect(MockGPX).toHaveBeenCalledTimes(2)
    expect(MockGPX).toHaveBeenLastCalledWith(
      'https://example.com/track2.gpx',
      expect.any(Object),
    )
  })

  it('renders map with no tracks when neither url nor tracks provided', () => {
    render(<GpxMap />)
    expect(screen.getByTestId('map-container-wrapper')).toBeInTheDocument()
    expect(MockGPX).not.toHaveBeenCalled()
  })

  describe('allowDownload', () => {
    let mockAnchorClick: jest.Mock
    let capturedAnchor: HTMLAnchorElement | undefined

    beforeEach(() => {
      mockAnchorClick = jest.fn()
      capturedAnchor = undefined
      Object.defineProperty(URL, 'createObjectURL', {
        writable: true,
        value: jest.fn().mockReturnValue('blob:mock-url'),
      })
      Object.defineProperty(URL, 'revokeObjectURL', {
        writable: true,
        value: jest.fn(),
      })
      const original = document.createElement.bind(document)
      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tag: string) => {
          const el = original(tag)
          if (tag === 'a') {
            capturedAnchor = el as HTMLAnchorElement
            jest.spyOn(el, 'click').mockImplementation(mockAnchorClick)
          }
          return el
        })
      const origAppend = document.body.appendChild.bind(document.body)
      jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation((child: Node) => {
          if ((child as HTMLElement).tagName === 'A') return child
          return origAppend(child)
        })
      const origRemove = document.body.removeChild.bind(document.body)
      jest
        .spyOn(document.body, 'removeChild')
        .mockImplementation((child: Node) => {
          if ((child as HTMLElement).tagName === 'A') return child
          return origRemove(child)
        })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('does not render download bar when allowDownload is false', () => {
      render(<GpxMap url={GPX_URL} />)
      expect(screen.queryByTestId('download-bar')).not.toBeInTheDocument()
    })

    it('renders download bar when allowDownload is true', () => {
      render(<GpxMap url={GPX_URL} allowDownload />)
      expect(screen.getByTestId('download-bar')).toBeInTheDocument()
    })

    it('uses default label "Download GPX" when downloadLabel not provided', () => {
      render(<GpxMap url={GPX_URL} allowDownload />)
      expect(
        screen.getByRole('button', { name: 'Download GPX' }),
      ).toBeInTheDocument()
    })

    it('uses custom downloadLabel when provided', () => {
      render(
        <GpxMap url={GPX_URL} allowDownload downloadLabel="Descargar GPX" />,
      )
      expect(
        screen.getByRole('button', { name: 'Descargar GPX' }),
      ).toBeInTheDocument()
    })

    it('download button fetches url and triggers file download', async () => {
      const mockBlob = new Blob(['<gpx/>'], { type: 'application/gpx+xml' })
      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(mockBlob),
        text: jest.fn().mockResolvedValue(''),
      } as unknown as Response)

      render(<GpxMap url={GPX_URL} allowDownload />)
      fireEvent.click(screen.getByRole('button', { name: 'Download GPX' }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(GPX_URL)
        expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
        expect(mockAnchorClick).toHaveBeenCalled()
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
      })
      expect(capturedAnchor?.download).toBe('track.gpx')
    })

    it('uses track.gpx fallback filename when url has no filename segment', async () => {
      const mockBlob = new Blob(['<gpx/>'])
      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(mockBlob),
        text: jest.fn().mockResolvedValue(''),
      } as unknown as Response)

      render(<GpxMap url="https://example.com/" allowDownload />)
      fireEvent.click(screen.getByRole('button', { name: 'Download GPX' }))

      await waitFor(() => expect(mockAnchorClick).toHaveBeenCalled())
      expect(capturedAnchor?.download).toBe('track.gpx')
    })

    it('download button with no tracks calls downloadGpx with empty string', async () => {
      const mockBlob = new Blob([''])
      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(mockBlob),
        text: jest.fn().mockResolvedValue(''),
      } as unknown as Response)
      render(<GpxMap allowDownload />)
      fireEvent.click(
        within(screen.getByTestId('download-bar')).getByRole('button'),
      )
      await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(''))
    })

    it('multi-track download button triggers file download for that track', async () => {
      const MULTI_TRACKS: GpxTrackDef[] = [
        { url: 'https://example.com/t1.gpx', name: 'Outbound' },
        { url: 'https://example.com/t2.gpx', name: 'Return' },
      ]
      const mockBlob = new Blob(['<gpx/>'], { type: 'application/gpx+xml' })
      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(mockBlob),
        text: jest.fn().mockResolvedValue(''),
      } as unknown as Response)

      render(
        <GpxMap
          tracks={MULTI_TRACKS}
          allowDownload
          downloadLabel="Download GPX"
        />,
      )
      fireEvent.click(screen.getByTestId('track-download-1'))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('https://example.com/t2.gpx')
        expect(mockAnchorClick).toHaveBeenCalled()
      })
    })
  })

  describe('labels', () => {
    it('uses default waypoints label', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      expect(await screen.findByText('Waypoints (2)')).toBeInTheDocument()
    })

    it('uses custom waypoints label', async () => {
      render(
        <GpxMap
          url={GPX_URL}
          showWaypoints
          labels={{ waypoints: 'Puntos de interés' }}
        />,
      )
      expect(
        await screen.findByText('Puntos de interés (2)'),
      ).toBeInTheDocument()
    })

    it('uses default column headers', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByTestId('waypoints-details')
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Coordinates')).toBeInTheDocument()
      expect(screen.getByText('Elevation')).toBeInTheDocument()
    })

    it('uses custom column headers', async () => {
      render(
        <GpxMap
          url={GPX_URL}
          showWaypoints
          labels={{
            colName: 'Nombre',
            colCoordinates: 'Coordenadas',
            colElevation: 'Elevación',
          }}
        />,
      )
      await screen.findByTestId('waypoints-details')
      expect(screen.getByText('Nombre')).toBeInTheDocument()
      expect(screen.getByText('Coordenadas')).toBeInTheDocument()
      expect(screen.getByText('Elevación')).toBeInTheDocument()
    })

    it('uses default flyTo aria-label on locate button', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Refugio Mar')
      expect(
        screen.getAllByRole('button', { name: 'View on map' }),
      ).toHaveLength(2)
    })

    it('uses custom flyTo aria-label on locate button', async () => {
      render(
        <GpxMap
          url={GPX_URL}
          showWaypoints
          labels={{ flyTo: 'Ver en el mapa' }}
        />,
      )
      await screen.findByText('Refugio Mar')
      expect(
        screen.getAllByRole('button', { name: 'Ver en el mapa' }),
      ).toHaveLength(2)
    })
  })

  describe('showWaypoints', () => {
    it('does not fetch when showWaypoints is false', () => {
      render(<GpxMap url={GPX_URL} />)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('does not show waypoints section when showWaypoints is false', () => {
      render(<GpxMap url={GPX_URL} />)
      expect(screen.queryByTestId('waypoints-details')).not.toBeInTheDocument()
    })

    it('fetches GPX and renders waypoints table when showWaypoints is true', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      expect(await screen.findByTestId('waypoints-details')).toBeInTheDocument()
      expect(screen.getByText('Refugio Mar')).toBeInTheDocument()
      expect(screen.getByText('43.50000, -5.60000')).toBeInTheDocument()
      expect(screen.getByText('1201m')).toBeInTheDocument()
      expect(screen.getByText('Summit')).toBeInTheDocument()
      expect(screen.getByText('43.60000, -5.70000')).toBeInTheDocument()
      expect(screen.getByText('1500m')).toBeInTheDocument()
    })

    it('shows waypoint count in summary', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      expect(await screen.findByText('Waypoints (2)')).toBeInTheDocument()
    })

    it('shows dash for missing name and ele', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue(`<?xml version="1.0"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="43.5" lon="-5.6"></wpt>
</gpx>`),
      } as unknown as Response)
      render(<GpxMap url={GPX_URL} showWaypoints />)
      expect(await screen.findByTestId('waypoints-details')).toBeInTheDocument()
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText('43.50000, -5.60000')).toBeInTheDocument()
    })

    it('does not show waypoints details when GPX has no waypoints', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue(GPX_XML_NO_WAYPOINTS),
      } as unknown as Response)
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      expect(screen.queryByTestId('waypoints-details')).not.toBeInTheDocument()
    })

    it('does not show waypoints details when fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network'))
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      expect(screen.queryByTestId('waypoints-details')).not.toBeInTheDocument()
    })

    it('row click expands to show description', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Refugio Mar')
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[1])
      expect(rows[1]).toHaveAttribute('data-expanded', 'true')
      expect(screen.getByText('Mountain refuge')).toBeInTheDocument()
    })

    it('row click collapses on second click', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Refugio Mar')
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[1])
      fireEvent.click(rows[1])
      expect(rows[1]).not.toHaveAttribute('data-expanded')
      expect(screen.queryByText('Mountain refuge')).not.toBeInTheDocument()
    })

    it('does not expand row when waypoint has no desc and no image', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Summit')
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[2])
      expect(rows[2]).not.toHaveAttribute('data-expanded')
      expect(
        screen
          .getAllByRole('row')
          .filter((r) => r.getAttribute('data-details') === 'true'),
      ).toHaveLength(0)
    })

    it('row with desc has data-clickable attribute', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Refugio Mar')
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveAttribute('data-clickable', 'true')
    })

    it('row without desc and image does not have data-clickable', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Summit')
      const rows = screen.getAllByRole('row')
      expect(rows[2]).not.toHaveAttribute('data-clickable')
    })

    it('locate button flies to first waypoint', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Refugio Mar')
      const buttons = screen.getAllByRole('button', { name: 'View on map' })
      fireEvent.click(buttons[0])
      expect(mockFlyTo).toHaveBeenCalledWith([43.5, -5.6], 18)
    })

    it('locate button flies to second waypoint', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Summit')
      const buttons = screen.getAllByRole('button', { name: 'View on map' })
      fireEvent.click(buttons[1])
      expect(mockFlyTo).toHaveBeenCalledWith([43.6, -5.7], 18)
    })

    it('locate button renders circle marker at waypoint coords', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Refugio Mar')
      expect(screen.queryByTestId('circle-marker')).not.toBeInTheDocument()
      const buttons = screen.getAllByRole('button', { name: 'View on map' })
      fireEvent.click(buttons[0])
      const marker = screen.getByTestId('circle-marker')
      expect(marker).toHaveAttribute(
        'data-center',
        JSON.stringify([43.5, -5.6]),
      )
    })

    it('locate button does not expand the row', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Refugio Mar')
      const rows = screen.getAllByRole('row')
      const buttons = screen.getAllByRole('button', { name: 'View on map' })
      fireEvent.click(buttons[0])
      expect(rows[1]).not.toHaveAttribute('data-expanded')
    })

    it('locate button scrolls map container into view', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Refugio Mar')
      const container = screen.getByTestId('map-container-wrapper')
      const mockScrollIntoView = jest.fn()
      container.scrollIntoView = mockScrollIntoView
      const buttons = screen.getAllByRole('button', { name: 'View on map' })
      fireEvent.click(buttons[0])
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  })

  describe('waypointImages', () => {
    it('shows expand chevron for waypoint with image', async () => {
      render(
        <GpxMap
          url={GPX_URL}
          showWaypoints
          waypointImages={{ 'Refugio Mar': 'https://cdn.com/img.jpg' }}
        />,
      )
      await screen.findByText('Refugio Mar')
      expect(screen.getByTestId('expand-chevron')).toBeInTheDocument()
    })

    it('does not show expand chevron when waypoint has no image or desc', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue(`<?xml version="1.0"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="43.5" lon="-5.6"><name>Plain</name></wpt>
</gpx>`),
      } as unknown as Response)
      render(<GpxMap url={GPX_URL} showWaypoints />)
      await screen.findByText('Plain')
      expect(screen.queryByTestId('expand-chevron')).not.toBeInTheDocument()
    })

    it('does not show expand chevron for waypoint without matching image and no desc', async () => {
      render(
        <GpxMap
          url={GPX_URL}
          showWaypoints
          waypointImages={{ Other: 'https://cdn.com/img.jpg' }}
        />,
      )
      await screen.findByText('Summit')
      const chevrons = screen.getAllByTestId('expand-chevron')
      expect(chevrons).toHaveLength(1)
    })

    it('shows image card in expanded row when waypoint has image', async () => {
      render(
        <GpxMap
          url={GPX_URL}
          showWaypoints
          waypointImages={{ 'Refugio Mar': 'https://cdn.com/img.jpg' }}
        />,
      )
      await screen.findByText('Refugio Mar')
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[1])
      const img = screen.getByTestId('waypoint-image-card')
      expect(img).toHaveAttribute('src', 'https://cdn.com/img.jpg')
      expect(img).toHaveAttribute('alt', 'Refugio Mar')
    })

    it('shows description alongside image when both present', async () => {
      render(
        <GpxMap
          url={GPX_URL}
          showWaypoints
          waypointImages={{ 'Refugio Mar': 'https://cdn.com/img.jpg' }}
        />,
      )
      await screen.findByText('Refugio Mar')
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[1])
      expect(screen.getByTestId('waypoint-image-card')).toBeInTheDocument()
      expect(screen.getByText('Mountain refuge')).toBeInTheDocument()
    })

    it('does not expand row when waypoint has no matching image and no desc', async () => {
      render(
        <GpxMap
          url={GPX_URL}
          showWaypoints
          waypointImages={{ Other: 'https://cdn.com/img.jpg' }}
        />,
      )
      await screen.findByText('Summit')
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[2])
      expect(rows[2]).not.toHaveAttribute('data-expanded')
      expect(
        screen
          .getAllByRole('row')
          .filter((r) => r.getAttribute('data-details') === 'true'),
      ).toHaveLength(0)
    })

    it('calls eachLayer on loaded event when waypointImages provided', () => {
      render(
        <GpxMap
          url={GPX_URL}
          waypointImages={{ 'Refugio Mar': 'https://cdn.com/img.jpg' }}
        />,
      )
      const loadedCallback = mockOn.mock.calls.find(
        (c: [string, () => void]) => c[0] === 'loaded',
      )?.[1]
      act(() => {
        loadedCallback()
      })
      expect(mockEachLayer).toHaveBeenCalled()
    })

    it('does not call eachLayer when no waypointImages', () => {
      render(<GpxMap url={GPX_URL} />)
      const loadedCallback = mockOn.mock.calls.find(
        (c: [string, () => void]) => c[0] === 'loaded',
      )?.[1]
      act(() => {
        loadedCallback()
      })
      expect(mockEachLayer).not.toHaveBeenCalled()
    })

    it('binds popup to layer with matching title', () => {
      const mockBindPopup = jest.fn()
      mockEachLayer.mockImplementationOnce((cb: (l: unknown) => void) => {
        cb({ options: { title: 'Refugio Mar' }, bindPopup: mockBindPopup })
      })
      render(
        <GpxMap
          url={GPX_URL}
          waypointImages={{ 'Refugio Mar': 'https://cdn.com/img.jpg' }}
        />,
      )
      const loadedCallback = mockOn.mock.calls.find(
        (c: [string, () => void]) => c[0] === 'loaded',
      )?.[1]
      act(() => {
        loadedCallback()
      })
      expect(mockBindPopup).toHaveBeenCalledWith(
        expect.stringContaining('https://cdn.com/img.jpg'),
        expect.objectContaining({ maxWidth: 200 }),
      )
    })

    it('does not bind popup to layer without title', () => {
      const mockBindPopup = jest.fn()
      mockEachLayer.mockImplementationOnce((cb: (l: unknown) => void) => {
        cb({ options: {}, bindPopup: mockBindPopup })
      })
      render(
        <GpxMap
          url={GPX_URL}
          waypointImages={{ 'Refugio Mar': 'https://cdn.com/img.jpg' }}
        />,
      )
      const loadedCallback = mockOn.mock.calls.find(
        (c: [string, () => void]) => c[0] === 'loaded',
      )?.[1]
      act(() => {
        loadedCallback()
      })
      expect(mockBindPopup).not.toHaveBeenCalled()
    })

    it('does not bind popup when title not in waypointImages', () => {
      const mockBindPopup = jest.fn()
      mockEachLayer.mockImplementationOnce((cb: (l: unknown) => void) => {
        cb({ options: { title: 'Unknown' }, bindPopup: mockBindPopup })
      })
      render(
        <GpxMap
          url={GPX_URL}
          waypointImages={{ 'Refugio Mar': 'https://cdn.com/img.jpg' }}
        />,
      )
      const loadedCallback = mockOn.mock.calls.find(
        (c: [string, () => void]) => c[0] === 'loaded',
      )?.[1]
      act(() => {
        loadedCallback()
      })
      expect(mockBindPopup).not.toHaveBeenCalled()
    })

    it('uses per-track waypointImages when provided on track def', () => {
      const mockBindPopup = jest.fn()
      mockEachLayer.mockImplementationOnce((cb: (l: unknown) => void) => {
        cb({ options: { title: 'Summit' }, bindPopup: mockBindPopup })
      })
      render(
        <GpxMap
          tracks={[
            {
              url: GPX_URL,
              waypointImages: { Summit: 'https://cdn.com/track-img.jpg' },
            },
          ]}
        />,
      )
      const loadedCallback = mockOn.mock.calls.find(
        (c: [string, () => void]) => c[0] === 'loaded',
      )?.[1]
      act(() => {
        loadedCallback()
      })
      expect(mockBindPopup).toHaveBeenCalledWith(
        expect.stringContaining('https://cdn.com/track-img.jpg'),
        expect.anything(),
      )
    })

    it('does not show dash when image present but no desc', async () => {
      render(
        <GpxMap
          url={GPX_URL}
          showWaypoints
          waypointImages={{ Summit: 'https://cdn.com/img.jpg' }}
        />,
      )
      await screen.findByText('Summit')
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[2])
      expect(screen.getByTestId('waypoint-image-card')).toBeInTheDocument()
      const detailRows = screen
        .getAllByRole('row')
        .filter((r) => r.getAttribute('data-details') === 'true')
      expect(detailRows[0]).not.toHaveTextContent('—')
    })
  })

  describe('multi-track', () => {
    const TRACKS: GpxTrackDef[] = [
      { url: 'https://example.com/t1.gpx', name: 'Outbound', color: '#e63946' },
      { url: 'https://example.com/t2.gpx', name: 'Return', color: '#3a86ff' },
    ]

    it('creates one GPX layer per track', () => {
      render(<GpxMap tracks={TRACKS} />)
      expect(MockGPX).toHaveBeenCalledTimes(2)
      expect(MockGPX).toHaveBeenCalledWith(
        'https://example.com/t1.gpx',
        expect.objectContaining({
          polyline_options: { color: '#e63946', weight: 3, opacity: 0.85 },
        }),
      )
      expect(MockGPX).toHaveBeenCalledWith(
        'https://example.com/t2.gpx',
        expect.objectContaining({
          polyline_options: { color: '#3a86ff', weight: 3, opacity: 0.85 },
        }),
      )
    })

    it('renders track strip for multi-track', () => {
      render(<GpxMap tracks={TRACKS} />)
      expect(screen.getByTestId('track-strip')).toBeInTheDocument()
    })

    it('does not render track strip for single-track', () => {
      render(<GpxMap url={GPX_URL} />)
      expect(screen.queryByTestId('track-strip')).not.toBeInTheDocument()
    })

    it('renders one track chip per track', () => {
      render(<GpxMap tracks={TRACKS} />)
      expect(screen.getAllByTestId('track-chip')).toHaveLength(2)
    })

    it('shows track names in strip', () => {
      render(<GpxMap tracks={TRACKS} />)
      expect(screen.getByText('Outbound')).toBeInTheDocument()
      expect(screen.getByText('Return')).toBeInTheDocument()
    })

    it('shows fallback name Track N when name not set', () => {
      render(
        <GpxMap
          tracks={[
            { url: 'https://example.com/t1.gpx' },
            { url: 'https://example.com/t2.gpx' },
          ]}
        />,
      )
      expect(screen.getByText('Track 1')).toBeInTheDocument()
      expect(screen.getByText('Track 2')).toBeInTheDocument()
    })

    it('shows colored track dots with active state', () => {
      render(<GpxMap tracks={TRACKS} />)
      const dots = screen.getAllByTestId('track-dot')
      expect(dots[0]).toHaveAttribute('data-color', '#e63946')
      expect(dots[0]).toHaveAttribute('data-active', 'true')
      expect(dots[1]).toHaveAttribute('data-color', '#3a86ff')
      expect(dots[1]).toHaveAttribute('data-active', 'true')
    })

    it('uses palette color when track has no color', () => {
      render(
        <GpxMap
          tracks={[
            { url: 'https://example.com/t1.gpx', name: 'A' },
            { url: 'https://example.com/t2.gpx', name: 'B' },
          ]}
        />,
      )
      const dots = screen.getAllByTestId('track-dot')
      expect(dots[0]).toHaveAttribute('data-color', '#e63946')
      expect(dots[1]).toHaveAttribute('data-color', '#3a86ff')
    })

    it('toggles track off: removes layer from map', () => {
      render(<GpxMap tracks={TRACKS} />)
      mockRemoveLayer.mockClear()
      fireEvent.click(screen.getByTestId('track-toggle-0'))
      expect(mockRemoveLayer).toHaveBeenCalled()
    })

    it('toggles track back on: adds layer to map', () => {
      render(<GpxMap tracks={TRACKS} />)
      fireEvent.click(screen.getByTestId('track-toggle-0'))
      mockAddTo.mockClear()
      fireEvent.click(screen.getByTestId('track-toggle-0'))
      expect(mockAddTo).toHaveBeenCalled()
    })

    it('track dot shows inactive after toggle off', () => {
      render(<GpxMap tracks={TRACKS} />)
      fireEvent.click(screen.getByTestId('track-toggle-0'))
      const dots = screen.getAllByTestId('track-dot')
      expect(dots[0]).toHaveAttribute('data-active', 'false')
    })

    it('does not render download buttons in strip when allowDownload is false', () => {
      render(<GpxMap tracks={TRACKS} />)
      expect(screen.queryByTestId('track-download-0')).not.toBeInTheDocument()
    })

    it('renders download button per track when allowDownload is true', () => {
      render(<GpxMap tracks={TRACKS} allowDownload />)
      expect(screen.getByTestId('track-download-0')).toBeInTheDocument()
      expect(screen.getByTestId('track-download-1')).toBeInTheDocument()
    })

    it('download button has label with track name', () => {
      render(
        <GpxMap tracks={TRACKS} allowDownload downloadLabel="Download GPX" />,
      )
      expect(
        screen.getByRole('button', { name: 'Download GPX Outbound' }),
      ).toBeInTheDocument()
    })

    it('fetches waypoints from all tracks when showWaypoints is true', async () => {
      render(<GpxMap tracks={TRACKS} showWaypoints />)
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2))
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/t1.gpx')
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/t2.gpx')
    })

    it('fetches only track with per-track showWaypoints when global prop is false', async () => {
      render(
        <GpxMap
          tracks={[
            {
              url: 'https://example.com/t1.gpx',
              name: 'T1',
              showWaypoints: true,
            },
            { url: 'https://example.com/t2.gpx', name: 'T2' },
          ]}
        />,
      )
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/t1.gpx')
      expect(global.fetch).not.toHaveBeenCalledWith(
        'https://example.com/t2.gpx',
      )
    })

    it('renders waypoints sections per track with named label', async () => {
      render(<GpxMap tracks={TRACKS} showWaypoints />)
      expect(
        await screen.findByText('Waypoints – Outbound (2)'),
      ).toBeInTheDocument()
      expect(screen.getByText('Waypoints – Return (2)')).toBeInTheDocument()
    })

    it('hides waypoints table when track is toggled off', async () => {
      render(<GpxMap tracks={TRACKS} showWaypoints />)
      expect(
        await screen.findByText('Waypoints – Outbound (2)'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('track-toggle-0'))
      expect(
        screen.queryByText('Waypoints – Outbound (2)'),
      ).not.toBeInTheDocument()
      expect(screen.getByText('Waypoints – Return (2)')).toBeInTheDocument()
    })

    it('does not render download bar for multi-track even when allowDownload', () => {
      render(<GpxMap tracks={TRACKS} allowDownload />)
      expect(screen.queryByTestId('download-bar')).not.toBeInTheDocument()
    })

    it('uses tracks prop over url prop when both provided', () => {
      render(<GpxMap url="https://example.com/legacy.gpx" tracks={TRACKS} />)
      expect(MockGPX).toHaveBeenCalledTimes(2)
      expect(MockGPX).not.toHaveBeenCalledWith(
        'https://example.com/legacy.gpx',
        expect.anything(),
      )
    })

    it('shows download button only for track with per-track allowDownload', () => {
      render(
        <GpxMap
          tracks={[
            {
              url: 'https://example.com/t1.gpx',
              name: 'T1',
              allowDownload: true,
            },
            { url: 'https://example.com/t2.gpx', name: 'T2' },
          ]}
        />,
      )
      expect(screen.getByTestId('track-download-0')).toBeInTheDocument()
      expect(screen.queryByTestId('track-download-1')).not.toBeInTheDocument()
    })

    it('shows single-track download bar when track def has allowDownload true', () => {
      render(<GpxMap tracks={[{ url: GPX_URL, allowDownload: true }]} />)
      expect(
        screen.getByRole('button', { name: 'Download GPX' }),
      ).toBeInTheDocument()
    })

    it('new track added via prop rerender defaults to visible', () => {
      const { rerender } = render(<GpxMap tracks={[TRACKS[0]]} />)
      rerender(<GpxMap tracks={TRACKS} />)
      expect(screen.getByTestId('track-toggle-1')).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })
  })
  describe('tile provider switcher', () => {
    it('renders layer switcher', () => {
      render(<GpxMap url={GPX_URL} />)
      expect(screen.getByTestId('layer-switcher')).toBeInTheDocument()
    })

    it('OSM is active by default', () => {
      render(<GpxMap url={GPX_URL} />)
      expect(screen.getByTestId('tile-provider-osm')).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByTestId('tile-provider-topo')).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      expect(screen.getByTestId('tile-provider-satellite')).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })

    it('switches to topo tile layer', () => {
      render(<GpxMap url={GPX_URL} />)
      fireEvent.click(screen.getByTestId('tile-provider-topo'))
      expect(screen.getByTestId('tile-layer')).toHaveAttribute(
        'data-url',
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      )
      expect(screen.getByTestId('tile-provider-topo')).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByTestId('tile-provider-osm')).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })

    it('switches to satellite tile layer', () => {
      render(<GpxMap url={GPX_URL} />)
      fireEvent.click(screen.getByTestId('tile-provider-satellite'))
      expect(screen.getByTestId('tile-layer')).toHaveAttribute(
        'data-url',
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      )
      expect(screen.getByTestId('tile-provider-satellite')).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('switching back to OSM restores OSM tile layer', () => {
      render(<GpxMap url={GPX_URL} />)
      fireEvent.click(screen.getByTestId('tile-provider-topo'))
      fireEvent.click(screen.getByTestId('tile-provider-osm'))
      expect(screen.getByTestId('tile-layer')).toHaveAttribute(
        'data-url',
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      )
      expect(screen.getByTestId('tile-provider-osm')).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('updates map maxZoom when switching tile providers', () => {
      render(<GpxMap url={GPX_URL} />)
      fireEvent.click(screen.getByTestId('tile-provider-topo'))
      expect(mockSetMaxZoom).toHaveBeenCalledWith(17)
      fireEvent.click(screen.getByTestId('tile-provider-satellite'))
      expect(mockSetMaxZoom).toHaveBeenCalledWith(19)
      fireEvent.click(screen.getByTestId('tile-provider-osm'))
      expect(mockSetMaxZoom).toHaveBeenCalledWith(19)
    })
  })
})

describe('parseWaypointsFromXml', () => {
  it('parses name, desc, rounded elevation, lat, lon and sym', () => {
    const result = parseWaypointsFromXml(GPX_XML_WITH_WAYPOINTS)
    expect(result).toEqual([
      {
        name: 'Refugio Mar',
        desc: 'Mountain refuge',
        ele: 1201,
        lat: 43.5,
        lon: -5.6,
        sym: 'Campground',
      },
      {
        name: 'Summit',
        desc: '',
        ele: 1500,
        lat: 43.6,
        lon: -5.7,
        sym: 'Summit',
      },
    ])
  })

  it('returns null ele when ele element is missing', () => {
    const xml = `<gpx><wpt lat="0" lon="0"><name>A</name></wpt></gpx>`
    const [wpt] = parseWaypointsFromXml(xml)
    expect(wpt.ele).toBeNull()
    expect(wpt.lat).toBe(0)
    expect(wpt.lon).toBe(0)
    expect(wpt.sym).toBe('')
  })

  it('returns empty array when no waypoints', () => {
    expect(parseWaypointsFromXml(GPX_XML_NO_WAYPOINTS)).toEqual([])
  })

  it('handles missing name and desc', () => {
    const xml = `<gpx><wpt lat="10" lon="20"><ele>100</ele></wpt></gpx>`
    const [wpt] = parseWaypointsFromXml(xml)
    expect(wpt.name).toBe('')
    expect(wpt.desc).toBe('')
    expect(wpt.ele).toBe(100)
    expect(wpt.lat).toBe(10)
    expect(wpt.lon).toBe(20)
  })

  it('defaults lat and lon to 0 when attributes are missing', () => {
    const xml = `<gpx><wpt><name>A</name></wpt></gpx>`
    const [wpt] = parseWaypointsFromXml(xml)
    expect(wpt.lat).toBe(0)
    expect(wpt.lon).toBe(0)
  })

  it('parses sym tag', () => {
    const xml = `<gpx><wpt lat="0" lon="0"><name>A</name><sym>Warning</sym></wpt></gpx>`
    const [wpt] = parseWaypointsFromXml(xml)
    expect(wpt.sym).toBe('Warning')
  })

  it('defaults sym to empty string when sym element is missing', () => {
    const xml = `<gpx><wpt lat="0" lon="0"><name>A</name></wpt></gpx>`
    const [wpt] = parseWaypointsFromXml(xml)
    expect(wpt.sym).toBe('')
  })
})

describe('parseElevationFromXml', () => {
  it('returns empty array when no trkpt elements', () => {
    const xml = `<?xml version="1.0"?><gpx xmlns="http://www.topografix.com/GPX/1/1"></gpx>`
    expect(parseElevationFromXml(xml)).toEqual([])
  })

  it('returns single point with distance 0 for single trkpt', () => {
    const xml = `<gpx><trk><trkseg><trkpt lat="43.5" lon="-5.6"><ele>100</ele></trkpt></trkseg></trk></gpx>`
    const result = parseElevationFromXml(xml)
    expect(result).toHaveLength(1)
    expect(result[0].distance).toBe(0)
    expect(result[0].elevation).toBe(100)
    expect(result[0].lat).toBe(43.5)
    expect(result[0].lon).toBe(-5.6)
  })

  it('calculates cumulative distance for two points', () => {
    const xml = `<gpx><trk><trkseg>
      <trkpt lat="43.5" lon="-5.6"><ele>100</ele></trkpt>
      <trkpt lat="43.51" lon="-5.61"><ele>110</ele></trkpt>
    </trkseg></trk></gpx>`
    const result = parseElevationFromXml(xml)
    expect(result).toHaveLength(2)
    expect(result[0].distance).toBe(0)
    expect(result[1].distance).toBeGreaterThan(0)
    expect(result[1].elevation).toBe(110)
  })

  it('skips points without ele element', () => {
    const xml = `<gpx><trk><trkseg>
      <trkpt lat="43.5" lon="-5.6"><ele>100</ele></trkpt>
      <trkpt lat="43.51" lon="-5.61"></trkpt>
      <trkpt lat="43.52" lon="-5.62"><ele>120</ele></trkpt>
    </trkseg></trk></gpx>`
    const result = parseElevationFromXml(xml)
    expect(result).toHaveLength(2)
    expect(result[0].elevation).toBe(100)
    expect(result[1].elevation).toBe(120)
  })

  it('downsamples to max 300 points when more than 300 points', () => {
    const points = Array.from(
      { length: 400 },
      (_, i) =>
        `<trkpt lat="${43 + i * 0.001}" lon="${-5 + i * 0.001}"><ele>${100 + i}</ele></trkpt>`,
    ).join('\n')
    const xml = `<gpx><trk><trkseg>${points}</trkseg></trk></gpx>`
    const result = parseElevationFromXml(xml)
    expect(result.length).toBeLessThanOrEqual(300)
  })

  it('always includes last point when downsampling', () => {
    const points = Array.from(
      { length: 400 },
      (_, i) =>
        `<trkpt lat="${43 + i * 0.001}" lon="${-5 + i * 0.001}"><ele>${100 + i}</ele></trkpt>`,
    ).join('\n')
    const xml = `<gpx><trk><trkseg>${points}</trkseg></trk></gpx>`
    const result = parseElevationFromXml(xml)
    expect(result[result.length - 1].elevation).toBe(499)
  })

  it('first result always has distance 0', () => {
    const result = parseElevationFromXml(GPX_XML_WITH_TRKPTS)
    expect(result[0].distance).toBe(0)
  })

  it('rounds elevation to nearest integer', () => {
    const xml = `<gpx><trk><trkseg><trkpt lat="43.5" lon="-5.6"><ele>100.7</ele></trkpt></trkseg></trk></gpx>`
    const result = parseElevationFromXml(xml)
    expect(result[0].elevation).toBe(101)
  })

  it('defaults lat and lon to 0 when attributes are missing on trkpt', () => {
    const xml = `<gpx><trk><trkseg><trkpt><ele>100</ele></trkpt></trkseg></trk></gpx>`
    const result = parseElevationFromXml(xml)
    expect(result).toHaveLength(1)
    expect(result[0].distance).toBe(0)
    expect(result[0].elevation).toBe(100)
  })
})

describe('GpxMap showElevation', () => {
  const mockFitBounds = jest.fn()
  const mockRemoveLayer = jest.fn()
  const mockFlyTo = jest.fn()
  const mockSetMaxZoom = jest.fn()

  beforeEach(() => {
    mockFitBounds.mockReset()
    mockRemoveLayer.mockReset()
    mockFlyTo.mockReset()
    mockSetMaxZoom.mockReset()
    MockGPX.mockClear()
    mockOn.mockClear()
    mockAddTo.mockClear()
    mockGetBounds.mockReset()
    mockGetBounds.mockReturnValue({ _bounds: true })
    mockEachLayer.mockReset()
    window.HTMLElement.prototype.scrollIntoView = jest.fn()
    ;(useMap as jest.Mock).mockReturnValue({
      fitBounds: mockFitBounds,
      removeLayer: mockRemoveLayer,
      flyTo: mockFlyTo,
      setMaxZoom: mockSetMaxZoom,
    })
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(GPX_XML_WITH_TRKPTS),
    } as unknown as Response)
  })

  it('does not render elevation chart when showElevation is false', () => {
    render(<GpxMap url={GPX_URL} />)
    expect(screen.queryByTestId('elevation-chart')).not.toBeInTheDocument()
  })

  it('does not fetch when showElevation is false', () => {
    render(<GpxMap url={GPX_URL} />)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('fetches and renders elevation chart when showElevation is true', async () => {
    render(<GpxMap tracks={[{ url: GPX_URL, showElevation: true }]} />)
    expect(await screen.findByTestId('elevation-chart')).toBeInTheDocument()
  })

  it('does not render chart when fetched data has no trkpt', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(GPX_XML_NO_WAYPOINTS),
    } as unknown as Response)
    render(<GpxMap tracks={[{ url: GPX_URL, showElevation: true }]} />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(screen.queryByTestId('elevation-chart')).not.toBeInTheDocument()
  })

  it('does not set waypoints on fetch failure when only showElevation is set', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network'))
    render(<GpxMap tracks={[{ url: GPX_URL, showElevation: true }]} />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(screen.queryByTestId('elevation-chart')).not.toBeInTheDocument()
  })

  it('fetches once for track with both showWaypoints and showElevation', async () => {
    render(
      <GpxMap
        tracks={[{ url: GPX_URL, showWaypoints: true, showElevation: true }]}
      />,
    )
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
  })

  it('shows elevation label for multi-track when showElevation', async () => {
    const TRACKS: GpxTrackDef[] = [
      {
        url: 'https://example.com/t1.gpx',
        name: 'Outbound',
        showElevation: true,
      },
      { url: 'https://example.com/t2.gpx', name: 'Return' },
    ]
    render(<GpxMap tracks={TRACKS} />)
    expect(await screen.findByTestId('elevation-label')).toBeInTheDocument()
    expect(screen.getByTestId('elevation-label')).toHaveTextContent('Outbound')
  })

  it('does not show elevation label for single-track', async () => {
    render(<GpxMap tracks={[{ url: GPX_URL, showElevation: true }]} />)
    expect(await screen.findByTestId('elevation-chart')).toBeInTheDocument()
    expect(screen.queryByTestId('elevation-label')).not.toBeInTheDocument()
  })

  it('hides elevation chart when track is toggled off', async () => {
    const TRACKS: GpxTrackDef[] = [
      { url: GPX_URL, showElevation: true },
      { url: 'https://example.com/t2.gpx' },
    ]
    render(<GpxMap tracks={TRACKS} />)
    expect(await screen.findByTestId('elevation-chart')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('track-toggle-0'))
    expect(screen.queryByTestId('elevation-chart')).not.toBeInTheDocument()
  })

  it('shows elevation chart again when track is toggled back on', async () => {
    const TRACKS: GpxTrackDef[] = [
      { url: GPX_URL, showElevation: true },
      { url: 'https://example.com/t2.gpx' },
    ]
    render(<GpxMap tracks={TRACKS} />)
    expect(await screen.findByTestId('elevation-chart')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('track-toggle-0'))
    expect(screen.queryByTestId('elevation-chart')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('track-toggle-0'))
    expect(screen.getByTestId('elevation-chart')).toBeInTheDocument()
  })

  it('shows elevation cursor circle on map when hovering elevation chart', async () => {
    render(
      <GpxMap
        tracks={[{ url: GPX_URL, showElevation: true, color: '#ff0000' }]}
      />,
    )
    await screen.findByTestId('elevation-chart')
    expect(screen.queryByTestId('elevation-cursor')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('area-chart-trigger-hover'))
    const cursor = screen.getByTestId('elevation-cursor')
    const center = JSON.parse(cursor.getAttribute('data-center') ?? '[]')
    expect(center[0]).toBe(43.5)
    expect(center[1]).toBe(-5.6)
    expect(cursor.getAttribute('data-color')).toBe('#ff0000')
  })

  it('removes elevation cursor when mouse leaves elevation chart', async () => {
    render(<GpxMap tracks={[{ url: GPX_URL, showElevation: true }]} />)
    await screen.findByTestId('elevation-chart')
    fireEvent.click(screen.getByTestId('area-chart-trigger-hover'))
    expect(screen.getByTestId('elevation-cursor')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('area-chart-trigger-leave'))
    expect(screen.queryByTestId('elevation-cursor')).not.toBeInTheDocument()
  })

  it('does not show cursor when hover fires with null index', async () => {
    render(<GpxMap tracks={[{ url: GPX_URL, showElevation: true }]} />)
    await screen.findByTestId('elevation-chart')
    fireEvent.click(screen.getByTestId('area-chart-trigger-hover-no-index'))
    expect(screen.queryByTestId('elevation-cursor')).not.toBeInTheDocument()
  })

  it('does not show cursor when hover fires with out-of-bounds index', async () => {
    render(<GpxMap tracks={[{ url: GPX_URL, showElevation: true }]} />)
    await screen.findByTestId('elevation-chart')
    fireEvent.click(screen.getByTestId('area-chart-trigger-hover-oob'))
    expect(screen.queryByTestId('elevation-cursor')).not.toBeInTheDocument()
  })
})

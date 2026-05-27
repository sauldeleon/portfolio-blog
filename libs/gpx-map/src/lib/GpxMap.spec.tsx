import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useMap } from 'react-leaflet'

import { GpxMap, parseWaypointsFromXml } from './GpxMap'

jest.mock('leaflet/dist/leaflet.css', () => ({}))
jest.mock('leaflet-gpx', () => ({}))

jest.mock('leaflet', () => {
  const on = jest.fn()
  const addTo = jest.fn()
  const getBounds = jest.fn().mockReturnValue({ _bounds: true })
  const GPX = jest.fn().mockImplementation(() => ({ on, addTo, getBounds }))
  const IconDefault = {
    prototype: {},
    mergeOptions: jest.fn(),
  }
  return {
    __esModule: true,
    default: { GPX, Icon: { Default: IconDefault } },
    GPX,
    Icon: { Default: IconDefault },
    _testMocks: { on, addTo, getBounds, GPX },
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
  CircleMarker: ({
    center,
    radius,
  }: {
    center: [number, number]
    radius: number
  }) => (
    <div
      data-testid="circle-marker"
      data-center={JSON.stringify(center)}
      data-radius={radius}
    />
  ),
  useMap: jest.fn(),
}))

jest.mock('./GpxMap.styles', () => ({
  StyledGpxMap: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="gpx-map-wrapper">{children}</div>
  ),
  StyledMapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container-wrapper">{children}</div>
  ),
  StyledWaypointsDetails: ({ children }: { children: React.ReactNode }) => (
    <details data-testid="waypoints-details">{children}</details>
  ),
}))

const L = require('leaflet')
const { _testMocks } = L
const {
  on: mockOn,
  addTo: mockAddTo,
  getBounds: mockGetBounds,
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

describe('GpxMap', () => {
  const mockFitBounds = jest.fn()
  const mockRemoveLayer = jest.fn()
  const mockFlyTo = jest.fn()

  beforeEach(() => {
    mockFitBounds.mockReset()
    mockRemoveLayer.mockReset()
    mockFlyTo.mockReset()
    MockGPX.mockClear()
    mockOn.mockClear()
    mockAddTo.mockClear()
    mockGetBounds.mockReset()
    mockGetBounds.mockReturnValue({ _bounds: true })
    ;(useMap as jest.Mock).mockReturnValue({
      fitBounds: mockFitBounds,
      removeLayer: mockRemoveLayer,
      flyTo: mockFlyTo,
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
        startIconUrl: expect.stringContaining('data:image/svg+xml'),
        endIconUrl: expect.stringContaining('data:image/svg+xml'),
        shadowUrl: expect.stringContaining('data:image/gif'),
        wptIconUrls: expect.objectContaining({
          '': expect.stringContaining('data:image/svg+xml'),
          Warning: expect.stringContaining('data:image/svg+xml'),
          Summit: expect.stringContaining('data:image/svg+xml'),
        }),
        iconSize: [20, 26],
        iconAnchor: [10, 26],
        shadowSize: [0, 0],
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

    it('flies to first waypoint coords on row click', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      expect(await screen.findByText('Refugio Mar')).toBeInTheDocument()
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[1])
      expect(mockFlyTo).toHaveBeenCalledWith([43.5, -5.6], 18)
    })

    it('flies to second waypoint coords on row click', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      expect(await screen.findByText('Summit')).toBeInTheDocument()
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[2])
      expect(mockFlyTo).toHaveBeenCalledWith([43.6, -5.7], 18)
    })

    it('renders circle marker at clicked waypoint coords', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      expect(await screen.findByText('Refugio Mar')).toBeInTheDocument()
      expect(screen.queryByTestId('circle-marker')).not.toBeInTheDocument()
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[1])
      const marker = screen.getByTestId('circle-marker')
      expect(marker).toHaveAttribute(
        'data-center',
        JSON.stringify([43.5, -5.6]),
      )
    })

    it('marks clicked row as selected', async () => {
      render(<GpxMap url={GPX_URL} showWaypoints />)
      expect(await screen.findByText('Refugio Mar')).toBeInTheDocument()
      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[1])
      expect(rows[1]).toHaveAttribute('data-selected', 'true')
      expect(rows[2]).not.toHaveAttribute('data-selected')
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

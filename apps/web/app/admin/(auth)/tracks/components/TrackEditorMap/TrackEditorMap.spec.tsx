import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import type { GpxPoint, GpxTrack, GpxWaypoint } from '@sdlgr/gpx-tools'
import { RenderProviders } from '@sdlgr/test-utils'

import {
  MAX_MAP_ZOOM,
  MAX_VISIBLE_VERTICES,
  TrackEditorMap,
  type TrackEditorMapProps,
} from './TrackEditorMap'

const mockFitBounds = jest.fn()
const mockPanTo = jest.fn()
let mockBounds = { south: -90, west: -180, north: 90, east: 180 }
let mockHandlers: Record<string, (e?: unknown) => void> = {}

const mockInvalidateSize = jest.fn()
const mockObserve = jest.fn()
const mockDisconnect = jest.fn()
let mockResizeCallback: () => void = () => undefined
const mockContainer = document.createElement('div')

let mockSize = { x: 800, y: 600 }
const mockMapHandlers: Record<string, () => void> = {}

const mockMap = {
  getSize: () => mockSize,
  on: (event: string, handler: () => void) => {
    mockMapHandlers[event] = handler
  },
  off: (event: string) => {
    delete mockMapHandlers[event]
  },
  invalidateSize: () => mockInvalidateSize(),
  getContainer: () => mockContainer,
  fitBounds: (...args: unknown[]) => mockFitBounds(...args),
  panTo: (...args: unknown[]) => mockPanTo(...args),
  getBounds: () => ({
    getSouth: () => mockBounds.south,
    getWest: () => mockBounds.west,
    getNorth: () => mockBounds.north,
    getEast: () => mockBounds.east,
  }),
}

jest.mock('leaflet/dist/leaflet.css', () => ({}))

jest.mock('leaflet', () => ({
  __esModule: true,
  default: {
    divIcon: (options: { className: string }) => ({ ...options }),
    icon: jest.fn((options: { iconUrl: string }) => ({ ...options })),
    latLngBounds: (points: unknown[]) => ({ points }),
  },
}))

jest.mock('@sdlgr/gpx-tools', () => ({
  ...jest.requireActual('@sdlgr/gpx-tools'),
  MAP_ICON_ANCHOR: [10, 26],
  MAP_ICON_SIZE: [20, 26],
  TILE_PROVIDERS: [
    {
      id: 'osm',
      label: 'OSM',
      url: 'osm-url',
      attribution: 'osm',
      maxZoom: 19,
    },
    {
      id: 'topo',
      label: 'Topo',
      url: 'topo-url',
      attribution: 'topo',
      maxZoom: 17,
    },
  ],
  WPT_ICON_URLS: { '': 'default-icon', Summit: 'summit-icon' },
}))

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}))

interface MockMarkerProps {
  position: [number, number]
  icon: { className?: string; iconUrl?: string }
  draggable?: boolean
  title?: string
  opacity?: number
  eventHandlers: {
    click?: (e: unknown) => void
    dragend: (e: unknown) => void
  }
}

jest.mock('react-leaflet', () => ({
  CircleMarker: ({
    center,
    pathOptions,
    eventHandlers,
    'data-testid': testId,
  }: {
    center: [number, number]
    pathOptions: { fillColor: string }
    eventHandlers?: { click: (e: unknown) => void }
    'data-testid': string
  }) => (
    <div
      data-testid={testId}
      data-center={JSON.stringify(center)}
      data-fill={pathOptions.fillColor}
    >
      <button
        data-testid={`${testId}-click`}
        onClick={(e) =>
          eventHandlers?.click({ originalEvent: { shiftKey: e.shiftKey } })
        }
      />
    </div>
  ),
  MapContainer: ({
    children,
    doubleClickZoom,
    maxZoom,
  }: {
    children: ReactNode
    doubleClickZoom: boolean
    maxZoom: number
  }) => (
    <div
      data-testid="map"
      data-double-click-zoom={String(doubleClickZoom)}
      data-max-zoom={maxZoom}
    >
      {children}
    </div>
  ),
  TileLayer: ({
    url,
    maxNativeZoom,
  }: {
    url: string
    maxNativeZoom: number
  }) => (
    <div
      data-testid="tile-layer"
      data-url={url}
      data-max-native-zoom={maxNativeZoom}
    />
  ),
  Polyline: ({
    positions,
    pathOptions,
  }: {
    positions: unknown[]
    pathOptions: { color: string; opacity?: number }
  }) => (
    <div
      data-testid="polyline"
      data-color={pathOptions.color}
      data-opacity={pathOptions.opacity}
      data-count={positions.length}
    />
  ),
  Marker: ({
    position,
    icon,
    draggable,
    title,
    opacity,
    eventHandlers,
  }: MockMarkerProps) => (
    <div
      data-testid="marker"
      data-position={JSON.stringify(position)}
      data-icon={icon.className ?? icon.iconUrl}
      data-draggable={String(Boolean(draggable))}
      data-title={title}
      data-opacity={opacity}
    >
      <button
        data-testid="marker-click"
        onClick={(e) =>
          eventHandlers.click?.({ originalEvent: { shiftKey: e.shiftKey } })
        }
      />
      <button
        data-testid="marker-drag"
        onClick={() =>
          eventHandlers.dragend({
            target: { getLatLng: () => ({ lat: 1, lng: 2 }) },
          })
        }
      />
    </div>
  ),
  useMap: () => mockMap,
  useMapEvents: (handlers: Record<string, (e?: unknown) => void>) => {
    mockHandlers = handlers
    return mockMap
  },
}))

function point(i: number): GpxPoint {
  return { lat: 42 + i * 0.0001, lon: 0, ele: null, time: null }
}

function trackOf(count: number): GpxTrack[] {
  return [
    {
      name: 'T',
      segments: [{ points: Array.from({ length: count }, (_, i) => point(i)) }],
    },
  ]
}

const waypoints: GpxWaypoint[] = [
  {
    id: 'w1',
    lat: 42,
    lon: 0,
    ele: null,
    name: 'Top',
    desc: '',
    sym: 'Summit',
  },
  {
    id: 'w2',
    lat: 42.1,
    lon: 0,
    ele: null,
    name: 'Odd',
    desc: '',
    sym: 'Weird',
  },
  {
    id: 'w3',
    lat: 42.2,
    lon: 0,
    ele: null,
    name: 'Top2',
    desc: '',
    sym: 'Summit',
  },
]

function renderMap(props: Partial<TrackEditorMapProps> = {}) {
  const callbacks = {
    onVertexClick: jest.fn(),
    onVertexMove: jest.fn(),
    onMapClick: jest.fn(),
    onWaypointClick: jest.fn(),
    onWaypointMove: jest.fn(),
  }
  const all: TrackEditorMapProps = {
    original: trackOf(5),
    tracks: trackOf(5),
    preview: null,
    waypoints: [],
    mode: 'clean',
    activeSegment: { track: 0, segment: 0 },
    selection: null,
    clickMode: false,
    selectedWaypointId: null,
    ...callbacks,
    ...props,
  }
  const utils = render(<TrackEditorMap {...all} />, {
    wrapper: RenderProviders,
  })
  return { ...utils, ...callbacks, props: all }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSize = { x: 800, y: 600 }
  Object.keys(mockMapHandlers).forEach((k) => delete mockMapHandlers[k])
  window.ResizeObserver = jest.fn((callback: () => void) => {
    mockResizeCallback = callback
    return { observe: mockObserve, disconnect: mockDisconnect }
  }) as unknown as typeof ResizeObserver
  mockBounds = { south: -90, west: -180, north: 90, east: 180 }
  mockHandlers = {}
})

describe('TrackEditorMap', () => {
  it('fits the original track once and draws original and current lines', () => {
    const { rerender, props } = renderMap()
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
    const lines = screen.getAllByTestId('polyline')
    expect(lines.map((l) => l.dataset.color)).toEqual(['#9ca3af', '#e63946'])
    rerender(<TrackEditorMap {...props} tracks={trackOf(4)} />)
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  })

  it('waits for the map to have a size before fitting', () => {
    mockSize = { x: 800, y: 0 }
    renderMap()
    expect(mockFitBounds).not.toHaveBeenCalled()
    // Still no height: keeps waiting.
    act(() => mockMapHandlers.resize())
    expect(mockFitBounds).not.toHaveBeenCalled()
    mockSize = { x: 800, y: 600 }
    act(() => mockMapHandlers.resize())
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  })

  it('re-frames while the layout settles, until the user moves the map', () => {
    renderMap()
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
    act(() => mockMapHandlers.resize())
    expect(mockFitBounds).toHaveBeenCalledTimes(2)
    fireEvent.pointerDown(mockContainer)
    act(() => mockMapHandlers.resize())
    expect(mockFitBounds).toHaveBeenCalledTimes(2)
  })

  it('treats wheel zooming as user interaction', () => {
    renderMap()
    fireEvent.wheel(mockContainer)
    act(() => mockMapHandlers.resize())
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  })

  it('stops listening on unmount', () => {
    const { unmount } = renderMap()
    unmount()
    expect(mockMapHandlers.resize).toBeUndefined()
  })

  it('skips fitting an empty track', () => {
    renderMap({ original: [], tracks: [] })
    expect(mockFitBounds).not.toHaveBeenCalled()
  })

  it('colours inactive segments and shows the preview on top', () => {
    const tracks: GpxTrack[] = [
      { name: 'T', segments: [{ points: [point(0)] }, { points: [point(1)] }] },
    ]
    renderMap({ tracks, preview: trackOf(2) })
    const colors = screen.getAllByTestId('polyline').map((l) => l.dataset.color)
    expect(colors).toEqual(['#9ca3af', '#e63946', '#3a86ff', '#06d6a0'])
    expect(screen.getAllByTestId('polyline')[1].dataset.opacity).toBe('0.35')
  })

  it('switches tile providers', () => {
    renderMap()
    expect(screen.getByTestId('tile-layer')).toHaveAttribute(
      'data-url',
      'osm-url',
    )
    fireEvent.click(screen.getByTestId('editor-tile-topo'))
    expect(screen.getByTestId('tile-layer')).toHaveAttribute(
      'data-url',
      'topo-url',
    )
    expect(screen.getByTestId('editor-tile-topo')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('only forwards map clicks in click mode', () => {
    const { onMapClick, rerender, props } = renderMap()
    act(() => mockHandlers.click({ latlng: { lat: 1, lng: 2 } }))
    expect(onMapClick).not.toHaveBeenCalled()
    rerender(<TrackEditorMap {...props} clickMode />)
    act(() => mockHandlers.click({ latlng: { lat: 1, lng: 2 } }))
    expect(onMapClick).toHaveBeenCalledWith({ lat: 1, lon: 2 })
    expect(screen.getByTestId('map')).toHaveAttribute(
      'data-double-click-zoom',
      'false',
    )
  })

  it('renders vertices in view while editing, highlighting the selection', () => {
    const { onVertexClick } = renderMap({
      mode: 'edit',
      selection: { from: 3, to: 1 },
    })
    const vertices = screen.getAllByTestId('vertex')
    expect(vertices).toHaveLength(5)
    expect(vertices.map((v) => v.dataset.fill)).toEqual([
      '#fff',
      '#ffdd83',
      '#ffdd83',
      '#ffdd83',
      '#fff',
    ])
    // Selection line on top of the track; no drag handle for a range.
    const colors = screen.getAllByTestId('polyline').map((l) => l.dataset.color)
    expect(colors).toContain('#ffdd83')
    expect(screen.queryAllByTestId('marker')).toHaveLength(0)

    fireEvent.click(screen.getAllByTestId('vertex-click')[2], {
      shiftKey: true,
    })
    expect(onVertexClick).toHaveBeenCalledWith(2, true)
  })

  it('adds a drag handle to a single selected point', () => {
    const { onVertexMove } = renderMap({
      mode: 'edit',
      selection: { from: 4, to: 4 },
    })
    const handle = screen.getByTestId('marker')
    expect(handle).toHaveAttribute('data-icon', 'track-vertex-handle')
    expect(handle).toHaveAttribute('data-draggable', 'true')
    fireEvent.click(screen.getByTestId('marker-click'))
    fireEvent.click(screen.getByTestId('marker-drag'))
    expect(onVertexMove).toHaveBeenCalledWith(4, { lat: 1, lon: 2 })
  })

  it('has no handle outside edit mode', () => {
    renderMap({ mode: 'clean', selection: { from: 1, to: 1 } })
    expect(screen.queryAllByTestId('marker')).toHaveLength(0)
  })

  it('has no handle when the selected point no longer exists', () => {
    renderMap({ mode: 'edit', selection: { from: 9, to: 9 } })
    expect(screen.queryAllByTestId('marker')).toHaveLength(0)
  })

  it('hides vertices outside the viewport and refreshes on move', () => {
    mockBounds = { south: 41, west: -1, north: 42.00015, east: 1 }
    renderMap({ mode: 'edit' })
    expect(screen.getAllByTestId('vertex')).toHaveLength(2)
    mockBounds = { south: 42.00025, west: -1, north: 43, east: 1 }
    act(() => mockHandlers.moveend())
    expect(screen.getAllByTestId('vertex')).toHaveLength(2)
    mockBounds = { south: 41, west: 0.5, north: 43, east: 1 }
    act(() => mockHandlers.moveend())
    expect(screen.queryAllByTestId('vertex')).toHaveLength(0)
    mockBounds = { south: 41, west: -1, north: 43, east: -0.5 }
    act(() => mockHandlers.moveend())
    expect(screen.queryAllByTestId('vertex')).toHaveLength(0)
  })

  it('shows a zoom hint instead of too many vertices', () => {
    renderMap({
      mode: 'edit',
      tracks: trackOf(MAX_VISIBLE_VERTICES + 1),
    })
    expect(screen.queryAllByTestId('vertex')).toHaveLength(0)
    expect(screen.getByTestId('zoom-hint')).toHaveTextContent(
      `tracks.edit.zoomHint {"count":${MAX_VISIBLE_VERTICES + 1}}`,
    )
  })

  it('does not draw vertices for a missing active segment', () => {
    renderMap({ mode: 'edit', activeSegment: { track: 3, segment: 0 } })
    expect(screen.queryAllByTestId('vertex')).toHaveLength(0)
  })

  it('zooms past the native tile zoom', () => {
    renderMap()
    expect(screen.getByTestId('map')).toHaveAttribute(
      'data-max-zoom',
      String(MAX_MAP_ZOOM),
    )
    expect(screen.getByTestId('tile-layer')).toHaveAttribute(
      'data-max-native-zoom',
      '19',
    )
  })

  it('renders waypoint markers with their icons', () => {
    const L = jest.requireMock('leaflet').default
    renderMap({ waypoints })
    const markers = screen.getAllByTestId('marker')
    expect(markers.map((m) => m.dataset.icon)).toEqual([
      'summit-icon',
      'default-icon',
      'summit-icon',
    ])
    // One icon per distinct image.
    expect(L.icon).toHaveBeenCalledTimes(2)
    expect(markers[0]).toHaveAttribute('data-title', 'Top')
    expect(markers[0]).toHaveAttribute('data-draggable', 'false')
    expect(markers[1]).toHaveAttribute('data-opacity', '1')
  })

  it('makes waypoints draggable and dims the unselected ones in waypoint mode', () => {
    const { onWaypointClick, onWaypointMove } = renderMap({
      waypoints,
      mode: 'waypoints',
      selectedWaypointId: 'w2',
    })
    const markers = screen.getAllByTestId('marker')
    expect(markers[0]).toHaveAttribute('data-draggable', 'true')
    expect(markers[0]).toHaveAttribute('data-opacity', '0.5')
    expect(markers[1]).toHaveAttribute('data-opacity', '1')
    expect(mockPanTo).toHaveBeenCalledWith([42.1, 0])
    fireEvent.click(screen.getAllByTestId('marker-click')[0])
    expect(onWaypointClick).toHaveBeenCalledWith('w1')
    fireEvent.click(screen.getAllByTestId('marker-drag')[2])
    expect(onWaypointMove).toHaveBeenCalledWith('w3', { lat: 1, lon: 2 })
  })

  it('does not pan without a selected waypoint', () => {
    renderMap({ waypoints, mode: 'waypoints', selectedWaypointId: 'missing' })
    expect(mockPanTo).not.toHaveBeenCalled()
  })

  it('marks the point hovered on the profile', () => {
    renderMap({ hoverPoint: { lat: 42.5, lon: 0.5 } })
    expect(screen.getByTestId('hover-marker')).toHaveAttribute(
      'data-center',
      '[42.5,0.5]',
    )
  })

  it('pans to a focused point', () => {
    const { rerender, props } = renderMap()
    expect(mockPanTo).not.toHaveBeenCalled()
    rerender(<TrackEditorMap {...props} focusPoint={{ lat: 43, lon: 1 }} />)
    expect(mockPanTo).toHaveBeenCalledWith([43, 1])
  })

  it('resizes the map when its container changes size', () => {
    const { unmount } = renderMap()
    expect(mockObserve).toHaveBeenCalledWith(mockContainer)
    act(() => mockResizeCallback())
    expect(mockInvalidateSize).toHaveBeenCalled()
    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })
})

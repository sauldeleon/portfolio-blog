'use client'

import L from 'leaflet'
import 'leaflet-gpx'
import 'leaflet/dist/leaflet.css'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  AttributionControl,
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
} from 'react-leaflet'

import { ChevronIcon, DownloadIcon, MapPinIcon } from '@sdlgr/icons'

import {
  MAP_ICON_ANCHOR,
  MAP_ICON_END,
  MAP_ICON_SIZE,
  MAP_ICON_START,
  MAP_ICON_WPT,
  TRANSPARENT_1PX,
  WPT_ICON_URLS,
} from './GpxMap.icons'
import {
  StyledDownloadBar,
  StyledDownloadButton,
  StyledGpxMap,
  StyledLayerButton,
  StyledLayerSwitcher,
  StyledLocateButton,
  StyledMapContainer,
  StyledRowChevron,
  StyledTableWrapper,
  StyledTrackChip,
  StyledTrackDot,
  StyledTrackDownloadButton,
  StyledTrackStrip,
  StyledTrackToggle,
  StyledWaypointImageCard,
  StyledWaypointsDetails,
} from './GpxMap.styles'

// Fix broken L.Icon.Default paths (webpack/Next.js bundler mangles asset URLs).
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)[
  '_getIconUrl'
]
L.Icon.Default.mergeOptions({
  iconUrl: MAP_ICON_WPT,
  iconRetinaUrl: MAP_ICON_WPT,
  shadowUrl: TRANSPARENT_1PX,
  iconSize: MAP_ICON_SIZE,
  iconAnchor: MAP_ICON_ANCHOR,
  shadowSize: [0, 0],
})

export interface Waypoint {
  name: string
  desc: string
  ele: number | null
  lat: number
  lon: number
  sym: string
}

export function parseWaypointsFromXml(text: string): Waypoint[] {
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  return Array.from(doc.querySelectorAll('wpt')).map((wpt) => {
    const eleText = wpt.querySelector('ele')?.textContent
    return {
      name: wpt.querySelector('name')?.textContent ?? '',
      desc: wpt.querySelector('desc')?.textContent ?? '',
      ele: eleText ? Math.round(parseFloat(eleText)) : null,
      lat: parseFloat(wpt.getAttribute('lat') ?? '0'),
      lon: parseFloat(wpt.getAttribute('lon') ?? '0'),
      sym: wpt.querySelector('sym')?.textContent ?? '',
    }
  })
}

export interface GpxTrackDef {
  url: string
  name?: string
  color?: string
  allowDownload?: boolean
  showWaypoints?: boolean
  waypointImages?: Record<string, string>
}

export interface GpxMapLabels {
  waypoints?: string
  colName?: string
  colCoordinates?: string
  colElevation?: string
  flyTo?: string
}

export interface GpxMapProps {
  url?: string
  tracks?: GpxTrackDef[]
  showWaypoints?: boolean
  allowDownload?: boolean
  waypointImages?: Record<string, string>
  downloadLabel?: string
  labels?: GpxMapLabels
}

const TILE_PROVIDERS = [
  {
    id: 'osm',
    label: 'OSM',
    maxZoom: 19,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'topo',
    label: 'Topo',
    maxZoom: 17,
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    maxZoom: 20,
    url: 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg',
    attribution:
      '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
]

const TRACK_COLORS = [
  '#e63946',
  '#3a86ff',
  '#06d6a0',
  '#fb8500',
  '#8338ec',
  '#ff006e',
]

function resolveTrackColor(track: GpxTrackDef, index: number): string {
  return track.color || TRACK_COLORS[index % TRACK_COLORS.length]
}

function downloadGpx(url: string) {
  fetch(url)
    .then((r) => r.blob())
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = url.split('/').pop() || 'track.gpx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    })
}

function WaypointFocuser({ waypoint }: { waypoint: Waypoint | null }) {
  const map = useMap()
  useEffect(() => {
    if (!waypoint) return
    map.flyTo([waypoint.lat, waypoint.lon], 18)
  }, [waypoint, map])
  return null
}

function GpxTrackLayer({
  url,
  color,
  visible,
  waypointImages,
}: {
  url: string
  color: string
  visible: boolean
  waypointImages?: Record<string, string>
}) {
  const map = useMap()
  const layerRef = useRef<L.GPX | null>(null)
  const waypointImagesRef = useRef(waypointImages)
  useEffect(() => {
    waypointImagesRef.current = waypointImages
  }, [waypointImages])

  useEffect(() => {
    const layer = new L.GPX(url, {
      async: true,
      polyline_options: {
        color,
        weight: 3,
        opacity: 0.85,
      },
      marker_options: {
        shadowUrl: TRANSPARENT_1PX,
        iconSize: MAP_ICON_SIZE,
        iconAnchor: MAP_ICON_ANCHOR,
        shadowSize: [0, 0],
      },
      markers: {
        startIcon: MAP_ICON_START,
        endIcon: MAP_ICON_END,
        wptIcons: WPT_ICON_URLS,
      },
    })

    layer.on('loaded', () => {
      map.fitBounds(layer.getBounds())
      const imgs = waypointImagesRef.current
      if (imgs) {
        layer.eachLayer((l) => {
          const opts = (l as L.Marker).options as L.MarkerOptions & {
            title?: string
          }
          const name = opts?.title
          const imgUrl = name ? imgs[name] : undefined
          if (imgUrl) {
            ;(l as L.Marker).bindPopup(
              `<img src="${imgUrl}" style="width:180px;max-height:160px;object-fit:contain;display:block;" alt="${name}" />`,
              { maxWidth: 200 },
            )
          }
        })
      }
    })

    layerRef.current = layer

    return () => {
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [url, color, map])

  useEffect(() => {
    const layer = layerRef.current
    /* istanbul ignore next */
    if (!layer) return
    if (visible) {
      layer.addTo(map)
    } else {
      map.removeLayer(layer)
    }
  }, [url, visible, map])

  return null
}

export function GpxMap({
  url,
  tracks,
  showWaypoints,
  allowDownload,
  waypointImages,
  downloadLabel = 'Download GPX',
  labels,
}: GpxMapProps) {
  const {
    waypoints: waypointsLabel = 'Waypoints',
    colName = 'Name',
    colCoordinates = 'Coordinates',
    colElevation = 'Elevation',
    flyTo = 'View on map',
  } = labels ?? {}

  const resolvedTracks = useMemo<GpxTrackDef[]>(
    () => tracks ?? (url ? [{ url }] : []),

    [tracks, url],
  )

  const isMultiTrack = resolvedTracks.length > 1

  const [tileProviderIndex, setTileProviderIndex] = useState(0)
  const [visibleTracks, setVisibleTracks] = useState<Record<number, boolean>>(
    () => Object.fromEntries(resolvedTracks.map((_, i) => [i, true])),
  )
  const [perTrackWaypoints, setPerTrackWaypoints] = useState<
    Record<number, Waypoint[]>
  >({})
  const [focusedWaypoint, setFocusedWaypoint] = useState<Waypoint | null>(null)
  const [expandedByIndex, setExpandedByIndex] = useState<
    Record<number, number | null>
  >({})
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const trackUrlsKey = resolvedTracks
    .map((t) => `${t.url}|${t.showWaypoints}`)
    .join(',')

  useEffect(() => {
    resolvedTracks.forEach((track, i) => {
      const effectiveShowWaypoints = track.showWaypoints ?? showWaypoints
      if (!effectiveShowWaypoints) return
      fetch(track.url)
        .then((r) => r.text())
        .then((text) =>
          setPerTrackWaypoints((prev) => ({
            ...prev,
            [i]: parseWaypointsFromXml(text),
          })),
        )
        .catch(() => setPerTrackWaypoints((prev) => ({ ...prev, [i]: [] })))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackUrlsKey, showWaypoints])

  function toggleTrack(index: number) {
    setVisibleTracks((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  function flyToWaypoint(wpt: Waypoint) {
    setFocusedWaypoint(wpt)
    mapContainerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }

  return (
    <StyledGpxMap>
      <StyledMapContainer ref={mapContainerRef}>
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
          attributionControl={false}
        >
          <AttributionControl prefix={false} />
          <TileLayer
            attribution={TILE_PROVIDERS[tileProviderIndex].attribution}
            maxZoom={TILE_PROVIDERS[tileProviderIndex].maxZoom}
            url={TILE_PROVIDERS[tileProviderIndex].url}
          />
          {resolvedTracks.map((track, i) => (
            <GpxTrackLayer
              key={i}
              url={track.url}
              color={resolveTrackColor(track, i)}
              visible={visibleTracks[i] ?? true}
              waypointImages={track.waypointImages ?? waypointImages}
            />
          ))}
          <WaypointFocuser waypoint={focusedWaypoint} />
          {focusedWaypoint && (
            <CircleMarker
              center={[focusedWaypoint.lat, focusedWaypoint.lon]}
              radius={14}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.35,
                weight: 2,
              }}
            />
          )}
        </MapContainer>
        <StyledLayerSwitcher>
          {TILE_PROVIDERS.map((provider, i) => (
            <StyledLayerButton
              key={provider.id}
              type="button"
              $active={i === tileProviderIndex}
              onClick={() => setTileProviderIndex(i)}
              aria-pressed={i === tileProviderIndex}
              data-testid={`tile-provider-${provider.id}`}
            >
              {provider.label}
            </StyledLayerButton>
          ))}
        </StyledLayerSwitcher>
      </StyledMapContainer>

      {!isMultiTrack && (resolvedTracks[0]?.allowDownload ?? allowDownload) && (
        <StyledDownloadBar>
          <StyledDownloadButton
            aria-label={downloadLabel}
            onClick={() => downloadGpx(resolvedTracks[0]?.url ?? '')}
          >
            <DownloadIcon />
            {downloadLabel}
          </StyledDownloadButton>
        </StyledDownloadBar>
      )}

      {isMultiTrack && (
        <StyledTrackStrip>
          {resolvedTracks.map((track, i) => {
            const trackColor = resolveTrackColor(track, i)
            const isVisible = visibleTracks[i] ?? true
            const trackName = track.name || `Track ${i + 1}`
            return (
              <StyledTrackChip key={i}>
                <StyledTrackToggle
                  type="button"
                  onClick={() => toggleTrack(i)}
                  aria-pressed={isVisible}
                  data-testid={`track-toggle-${i}`}
                >
                  <StyledTrackDot $color={trackColor} $active={isVisible} />
                  {trackName}
                </StyledTrackToggle>
                {(track.allowDownload ?? allowDownload) && (
                  <StyledTrackDownloadButton
                    type="button"
                    onClick={() => downloadGpx(track.url)}
                    aria-label={`${downloadLabel} ${trackName}`}
                    data-testid={`track-download-${i}`}
                  >
                    <DownloadIcon />
                  </StyledTrackDownloadButton>
                )}
              </StyledTrackChip>
            )
          })}
        </StyledTrackStrip>
      )}

      {resolvedTracks.map((track, trackIndex) => {
        const effectiveShowWaypoints = track.showWaypoints ?? showWaypoints
        if (!effectiveShowWaypoints) return null
        if (!(visibleTracks[trackIndex] ?? /* istanbul ignore next */ true))
          return null
        const trackWaypoints = perTrackWaypoints[trackIndex] ?? []
        if (trackWaypoints.length === 0) return null
        const sectionLabel =
          isMultiTrack && track.name
            ? `${waypointsLabel} – ${track.name} (${trackWaypoints.length})`
            : `${waypointsLabel} (${trackWaypoints.length})`
        const expandedIndex = expandedByIndex[trackIndex] ?? null
        return (
          <StyledWaypointsDetails key={trackIndex}>
            <summary>{sectionLabel}</summary>
            <StyledTableWrapper>
              <table>
                <thead>
                  <tr>
                    <th>{colName}</th>
                    <th>{colCoordinates}</th>
                    <th>{colElevation}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {trackWaypoints.map((wpt, i) => {
                    const effectiveImages =
                      track.waypointImages ?? waypointImages
                    const hasDetails = !!(
                      effectiveImages?.[wpt.name] || wpt.desc
                    )
                    const isExpanded = expandedIndex === i
                    return (
                      <Fragment key={`${wpt.name}-${i}`}>
                        <tr
                          onClick={
                            hasDetails
                              ? () =>
                                  setExpandedByIndex((prev) => ({
                                    ...prev,
                                    [trackIndex]: isExpanded ? null : i,
                                  }))
                              : undefined
                          }
                          data-expanded={
                            hasDetails && isExpanded ? 'true' : undefined
                          }
                          data-clickable={hasDetails ? 'true' : undefined}
                        >
                          <td>
                            {hasDetails && (
                              <StyledRowChevron
                                $expanded={isExpanded}
                                data-testid="expand-chevron"
                              >
                                <ChevronIcon />
                              </StyledRowChevron>
                            )}
                            {wpt.name || '—'}
                          </td>
                          <td>{`${wpt.lat.toFixed(5)}, ${wpt.lon.toFixed(5)}`}</td>
                          <td>{wpt.ele != null ? `${wpt.ele}m` : '—'}</td>
                          <td>
                            <StyledLocateButton
                              aria-label={flyTo}
                              onClick={(e) => {
                                e.stopPropagation()
                                flyToWaypoint(wpt)
                              }}
                            >
                              <MapPinIcon />
                            </StyledLocateButton>
                          </td>
                        </tr>
                        {hasDetails && isExpanded && (
                          <tr data-details="true">
                            <td colSpan={4}>
                              {effectiveImages?.[wpt.name] && (
                                <StyledWaypointImageCard
                                  data-testid="waypoint-image-card"
                                  src={effectiveImages[wpt.name]}
                                  alt={wpt.name}
                                />
                              )}
                              {wpt.desc && <p>{wpt.desc}</p>}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </StyledTableWrapper>
          </StyledWaypointsDetails>
        )
      })}
    </StyledGpxMap>
  )
}

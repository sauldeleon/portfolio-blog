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
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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
  StyledElevationChart,
  StyledElevationLabel,
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

export function parseElevationFromXml(
  text: string,
): Array<{ distance: number; elevation: number }> {
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  const points = Array.from(doc.querySelectorAll('trkpt'))
  const result: Array<{ distance: number; elevation: number }> = []
  let cumKm = 0
  let prevLat: number | null = null
  let prevLon: number | null = null

  for (const pt of points) {
    const lat = parseFloat(pt.getAttribute('lat') ?? '0')
    const lon = parseFloat(pt.getAttribute('lon') ?? '0')
    const eleText = pt.querySelector('ele')?.textContent
    if (!eleText) continue
    const ele = parseFloat(eleText)

    if (prevLat !== null && prevLon !== null) {
      const R = 6371
      const dLat = ((lat - prevLat) * Math.PI) / 180
      const dLon = ((lon - prevLon) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((prevLat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2
      cumKm += R * 2 * Math.asin(Math.sqrt(a))
    }
    result.push({
      distance: Math.round(cumKm * 100) / 100,
      elevation: Math.round(ele),
    })
    prevLat = lat
    prevLon = lon
  }

  // Downsample to max 300 points for performance
  if (result.length > 300) {
    const step = Math.ceil(result.length / 300)
    return result.filter((_, i) => i % step === 0 || i === result.length - 1)
  }
  return result
}

/* istanbul ignore next */
function elevationXTickFormatter(v: number) {
  return `${v}km`
}
/* istanbul ignore next */
function elevationYTickFormatter(v: number) {
  return `${v}m`
}
/* istanbul ignore next */
function elevationTooltipFormatter(v: unknown) {
  return [`${v}m`, 'Elevation']
}
/* istanbul ignore next */
function elevationLabelFormatter(v: unknown) {
  return `${v}km`
}

function ElevationProfile({
  data,
  color,
  label,
}: {
  data: Array<{ distance: number; elevation: number }>
  color: string
  label?: string
}) {
  /* istanbul ignore next */
  if (data.length === 0) return null
  return (
    <StyledElevationChart data-testid="elevation-chart">
      {label && <StyledElevationLabel>{label}</StyledElevationLabel>}
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="distance"
            tickFormatter={elevationXTickFormatter}
            tick={{ fontSize: 9, fill: 'rgba(251,251,251,0.4)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={elevationYTickFormatter}
            tick={{ fontSize: 9, fill: 'rgba(251,251,251,0.4)' }}
            tickLine={false}
            axisLine={false}
            width={38}
          />
          <Tooltip
            formatter={elevationTooltipFormatter}
            labelFormatter={elevationLabelFormatter}
            contentStyle={{
              background: '#1a1a1a',
              border: '1px solid rgba(251,251,251,0.1)',
              fontSize: '0.65rem',
            }}
          />
          <Area
            type="monotone"
            dataKey="elevation"
            stroke={color}
            fill={color}
            fillOpacity={0.18}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </StyledElevationChart>
  )
}

export interface GpxTrackDef {
  url: string
  name?: string
  color?: string
  allowDownload?: boolean
  showWaypoints?: boolean
  showElevation?: boolean
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
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    maxZoom: 19,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy;',
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

function TileProviderMaxZoom({ maxZoom }: { maxZoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setMaxZoom(maxZoom)
  }, [maxZoom, map])
  return null
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
  const [elevationDataByTrack, setElevationDataByTrack] = useState<
    Record<number, Array<{ distance: number; elevation: number }>>
  >({})
  const [focusedWaypoint, setFocusedWaypoint] = useState<Waypoint | null>(null)
  const [expandedByIndex, setExpandedByIndex] = useState<
    Record<number, number | null>
  >({})
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const trackUrlsKey = resolvedTracks
    .map(
      (t) => `${t.url}|${t.showWaypoints ?? false}|${t.showElevation ?? false}`,
    )
    .join(',')

  useEffect(() => {
    resolvedTracks.forEach((track, i) => {
      const effectiveShowWaypoints = track.showWaypoints ?? showWaypoints
      const needsFetch = effectiveShowWaypoints || track.showElevation
      if (!needsFetch) return
      fetch(track.url)
        .then((r) => r.text())
        .then((text) => {
          if (effectiveShowWaypoints) {
            setPerTrackWaypoints((prev) => ({
              ...prev,
              [i]: parseWaypointsFromXml(text),
            }))
          }
          if (track.showElevation) {
            setElevationDataByTrack((prev) => ({
              ...prev,
              [i]: parseElevationFromXml(text),
            }))
          }
        })
        .catch(() => {
          if (effectiveShowWaypoints) {
            setPerTrackWaypoints((prev) => ({ ...prev, [i]: [] }))
          }
        })
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
          <TileProviderMaxZoom
            maxZoom={TILE_PROVIDERS[tileProviderIndex].maxZoom}
          />
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

      {resolvedTracks.map((track, i) => {
        if (!track.showElevation) return null
        const elevData = elevationDataByTrack[i]
        if (!elevData || elevData.length === 0) return null
        const color = resolveTrackColor(track, i)
        const label = isMultiTrack ? track.name : undefined
        return (
          <ElevationProfile
            key={i}
            data={elevData}
            color={color}
            label={label}
          />
        )
      })}
    </StyledGpxMap>
  )
}

'use client'

import L from 'leaflet'
import 'leaflet-gpx'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet'

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
  StyledGpxMap,
  StyledMapContainer,
  StyledWaypointsDetails,
} from './GpxMap.styles'

// Fix broken L.Icon.Default paths (webpack/Next.js bundler mangles asset URLs).
// Runs once at module load. Any marker that falls back to the default icon
// will use the waypoint SVG instead of a broken-image placeholder.
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

export interface GpxMapProps {
  url: string
  showWaypoints?: boolean
}

function WaypointFocuser({ waypoint }: { waypoint: Waypoint | null }) {
  const map = useMap()
  useEffect(() => {
    if (!waypoint) return
    map.flyTo([waypoint.lat, waypoint.lon], 18)
  }, [waypoint, map])
  return null
}

function GpxTrack({ url }: { url: string }) {
  const map = useMap()
  const layerRef = useRef<L.GPX | null>(null)

  useEffect(() => {
    const layer = new L.GPX(url, {
      async: true,
      polyline_options: {
        color: '#e63946',
        weight: 3,
        opacity: 0.85,
      },
      marker_options: {
        startIconUrl: MAP_ICON_START,
        endIconUrl: MAP_ICON_END,
        shadowUrl: TRANSPARENT_1PX,
        wptIconUrls: WPT_ICON_URLS,
        iconSize: MAP_ICON_SIZE,
        iconAnchor: MAP_ICON_ANCHOR,
        shadowSize: [0, 0],
      },
    })

    layer.on('loaded', () => {
      map.fitBounds(layer.getBounds())
    })

    layer.addTo(map)
    layerRef.current = layer

    return () => {
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [url, map])

  return null
}

export function GpxMap({ url, showWaypoints }: GpxMapProps) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [focusedWaypoint, setFocusedWaypoint] = useState<Waypoint | null>(null)

  useEffect(() => {
    if (!showWaypoints) return
    fetch(url)
      .then((r) => r.text())
      .then((text) => setWaypoints(parseWaypointsFromXml(text)))
      .catch(() => setWaypoints([]))
  }, [url, showWaypoints])

  return (
    <StyledGpxMap>
      <StyledMapContainer>
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GpxTrack url={url} />
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
      </StyledMapContainer>

      {showWaypoints && waypoints.length > 0 && (
        <StyledWaypointsDetails>
          <summary>Waypoints ({waypoints.length})</summary>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Coordinates</th>
                <th>Elevation</th>
              </tr>
            </thead>
            <tbody>
              {waypoints.map((wpt, i) => (
                <tr
                  key={`${wpt.name}-${i}`}
                  onClick={() => setFocusedWaypoint(wpt)}
                  data-selected={focusedWaypoint === wpt ? 'true' : undefined}
                >
                  <td>{wpt.name || '—'}</td>
                  <td>{`${wpt.lat.toFixed(5)}, ${wpt.lon.toFixed(5)}`}</td>
                  <td>{wpt.ele != null ? `${wpt.ele}m` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </StyledWaypointsDetails>
      )}
    </StyledGpxMap>
  )
}

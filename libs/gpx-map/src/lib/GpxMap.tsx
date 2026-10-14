'use client'

import axios from 'axios'
import L from 'leaflet'
import 'leaflet-gpx'
import 'leaflet/dist/leaflet.css'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

import {
  MAP_ICON_ANCHOR,
  MAP_ICON_END,
  MAP_ICON_SIZE,
  MAP_ICON_START,
  MAP_ICON_WPT,
  TILE_PROVIDERS,
  TRANSPARENT_1PX,
  WPT_ICON_URLS,
} from '@sdlgr/gpx-tools'
import {
  ChevronIcon,
  DownloadIcon,
  MapPinIcon,
  NoteIcon,
  PhotoIcon,
} from '@sdlgr/icons'

import {
  StyledDownloadBar,
  StyledDownloadButton,
  StyledElevationChart,
  StyledElevationLabel,
  StyledGpxMap,
  StyledLayerButton,
  StyledLayerSwitcher,
  StyledLightbox,
  StyledLightboxClose,
  StyledLightboxNav,
  StyledLocateButton,
  StyledMapContainer,
  StyledRowChevron,
  StyledTableWrapper,
  StyledTrackChip,
  StyledTrackDot,
  StyledTrackDownloadButton,
  StyledTrackStrip,
  StyledTrackToggle,
  StyledWaypointGalleryThumb,
  StyledWaypointGalleryThumbs,
  StyledWaypointImageCard,
  StyledWaypointNotes,
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

/**
 * Split a waypoint description into notes — one per line, each stripped of its
 * leading bullet, indented by its leading-whitespace level. Shared by the table
 * and the insert modal (which persists the parsed texts into the markdown).
 */
export function parseWaypointNotes(
  desc: string,
): Array<{ level: number; text: string }> {
  return desc
    .split(/\r?\n/)
    .map((raw) => ({
      level: Math.min(raw.length - raw.trimStart().length, 4),
      text: raw.replace(/^\s*[-•·]\s*/, '').trim(),
    }))
    .filter((n) => n.text)
}

export type ElevationPoint = {
  distance: number
  elevation: number
  lat: number
  lon: number
}

export function parseElevationFromXml(text: string): ElevationPoint[] {
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  const points = Array.from(doc.querySelectorAll('trkpt'))
  const result: ElevationPoint[] = []
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
      lat,
      lon,
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
  onHoverPoint,
  onHoverEnd,
}: {
  data: ElevationPoint[]
  color: string
  label?: string
  onHoverPoint?: (lat: number, lon: number, color: string) => void
  onHoverEnd?: () => void
}) {
  /* istanbul ignore next */
  if (data.length === 0) return null
  const elevations = data.map((p) => p.elevation)
  const minEle = Math.min(...elevations)
  const maxEle = Math.max(...elevations)
  const pad = (maxEle - minEle) * 0.15 + 10
  const yDomain: [number, number] = [
    Math.floor((minEle - pad) / 10) * 10,
    Math.ceil((maxEle + pad) / 10) * 10,
  ]
  return (
    <StyledElevationChart data-testid="elevation-chart">
      {label && <StyledElevationLabel>{label}</StyledElevationLabel>}
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
          onMouseMove={(state) => {
            const idx = state.activeTooltipIndex
            if (onHoverPoint && idx != null) {
              const pt = data[Number(idx)]
              if (pt) onHoverPoint(pt.lat, pt.lon, color)
            }
          }}
          onMouseLeave={() => onHoverEnd?.()}
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
            domain={yDomain}
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

/**
 * Build the HTML for a waypoint popup: a main image (zoomable, class
 * `gpx-popup-main`), a thumbnail strip when several images are pinned (class
 * `gpx-popup-thumb`, wired to swap the main image on popupopen), the name, and
 * any persisted description notes (flat list, like the croquis popover).
 */
export function buildWaypointPopupHtml(
  urls: string[],
  name: string,
  notes: string[] = [],
): string {
  const hasImg = urls.length > 0
  const main = hasImg
    ? `<img class="gpx-popup-main" src="${urls[0]}" style="width:100%;max-height:260px;object-fit:cover;display:block;cursor:zoom-in;" alt="${name}" />`
    : ''
  const thumbs =
    urls.length > 1
      ? `<div style="display:flex;gap:4px;padding:4px;overflow-x:auto;">` +
        urls
          .map(
            (u, i) =>
              `<img class="gpx-popup-thumb" src="${u}" style="width:44px;height:34px;object-fit:cover;border-radius:2px;cursor:pointer;flex:0 0 auto;opacity:${i === 0 ? '1' : '0.55'};" alt="" />`,
          )
          .join('') +
        `</div>`
      : ''
  const label = name
    ? `<p style="margin:0;padding:6px 8px 2px;font-size:0.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</p>`
    : ''
  const notesHtml =
    notes.length > 0
      ? `<ul style="margin:0;padding:2px 8px 6px 22px;list-style:disc;font-size:0.72rem;">` +
        notes.map((n) => `<li style="margin:1px 0;">${n}</li>`).join('') +
        `</ul>`
      : ''
  const width = hasImg ? 'min-width:240px;max-width:320px;' : 'max-width:280px;'
  return `<div style="${width}">${main}${thumbs}${label}${notesHtml}</div>`
}

/**
 * Expanded-row waypoint images: a single card for one image, or a small
 * slideshow (main image + thumbnail strip) when several are pinned.
 */
function WaypointImageGallery({
  images,
  alt,
}: {
  images: string[]
  alt: string
}) {
  const [index, setIndex] = useState(0)
  const current = images[Math.min(index, images.length - 1)]
  return (
    <>
      <StyledWaypointImageCard
        data-testid="waypoint-image-card"
        src={current}
        alt={alt}
      />
      {images.length > 1 && (
        <StyledWaypointGalleryThumbs data-testid="waypoint-gallery-thumbs">
          {images.map((img, i) => (
            <StyledWaypointGalleryThumb
              key={i}
              type="button"
              $active={i === index}
              onClick={() => setIndex(i)}
              aria-label={`${alt} image ${i + 1}`}
              data-testid={`waypoint-gallery-thumb-${i}`}
            >
              <img src={img} alt="" />
            </StyledWaypointGalleryThumb>
          ))}
        </StyledWaypointGalleryThumbs>
      )}
    </>
  )
}

export interface GpxTrackDef {
  url: string
  name?: string
  color?: string
  allowDownload?: boolean
  showWaypoints?: boolean
  showElevation?: boolean
  waypointImages?: Record<string, string[]>
  waypointNotes?: Record<string, string[]>
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
  waypointImages?: Record<string, string[]>
  waypointNotes?: Record<string, string[]>
  downloadLabel?: string
  labels?: GpxMapLabels
}

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
  axios.get<Blob>(url, { responseType: 'blob' }).then(({ data: blob }) => {
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
  showWaypoints,
  waypointImages,
  waypointNotes,
  onImageZoom,
}: {
  url: string
  color: string
  visible: boolean
  showWaypoints: boolean
  waypointImages?: Record<string, string[]>
  waypointNotes?: Record<string, string[]>
  onImageZoom: (images: string[], index: number) => void
}) {
  const map = useMap()
  const layerRef = useRef<L.GPX | null>(null)
  const waypointImagesRef = useRef(waypointImages)
  useEffect(() => {
    waypointImagesRef.current = waypointImages
  }, [waypointImages])
  const waypointNotesRef = useRef(waypointNotes)
  useEffect(() => {
    waypointNotesRef.current = waypointNotes
  }, [waypointNotes])
  const onImageZoomRef = useRef(onImageZoom)
  useEffect(() => {
    onImageZoomRef.current = onImageZoom
  }, [onImageZoom])

  // A waypoint popup's image opens a fullscreen viewer on click, like the
  // croquis. The popup is Leaflet-rendered HTML, so wire the click on open.
  useEffect(() => {
    const onPopupOpen = (e: L.PopupEvent) => {
      const el = e.popup.getElement()
      if (!el) return
      const main = el.querySelector<HTMLImageElement>('.gpx-popup-main')
      if (!main) return
      // Thumbnails swap the main image (touch has no hover), like the croquis.
      const thumbs = el.querySelectorAll<HTMLImageElement>('.gpx-popup-thumb')
      // Click the main image to open the fullscreen viewer at the current image,
      // with the whole gallery so you can page through it there too.
      main.onclick = () => {
        const images =
          thumbs.length > 0 ? Array.from(thumbs).map((t) => t.src) : [main.src]
        onImageZoomRef.current(images, Math.max(0, images.indexOf(main.src)))
      }
      thumbs.forEach((thumb) => {
        thumb.onclick = () => {
          main.src = thumb.src
          thumbs.forEach((t) => (t.style.opacity = '0.55'))
          thumb.style.opacity = '1'
        }
      })
    }
    map.on('popupopen', onPopupOpen)
    return () => {
      map.off('popupopen', onPopupOpen)
    }
  }, [map])

  useEffect(() => {
    // The GPX loads asynchronously; if this effect is torn down (unmount or dep
    // change) before `loaded` fires, react-leaflet may have already removed the
    // map, so fitBounds/bindPopup would run against a destroyed map. Guard it.
    let cancelled = false
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
      gpx_options: {
        parseElements: showWaypoints
          ? ['track', 'route', 'waypoint']
          : ['track', 'route'],
      },
    })

    layer.on('loaded', () => {
      if (cancelled) return
      map.fitBounds(layer.getBounds())
      const imgs = waypointImagesRef.current
      const notesMap = waypointNotesRef.current
      if (showWaypoints) {
        let wptIdx = 0
        const bindToMarker = (l: L.Layer) => {
          if ((l as L.LayerGroup).eachLayer) {
            ;(l as L.LayerGroup).eachLayer(bindToMarker)
            return
          }
          const opts = (l as L.Marker).options as L.MarkerOptions & {
            title?: string
            type?: string
          }
          if (opts.type !== 'waypoint') return
          const name = opts.title
          const key = String(wptIdx)
          const urls = imgs
            ? (imgs[key] ?? (name ? imgs[name] : undefined))
            : undefined
          const notes = notesMap
            ? (notesMap[key] ?? (name ? notesMap[name] : undefined))
            : undefined
          wptIdx++
          const imageUrls = urls ?? []
          const noteList = notes ?? []
          // Nothing worth showing → keep the default marker (no popup).
          if (imageUrls.length === 0 && !name && noteList.length === 0) return
          const content = buildWaypointPopupHtml(
            imageUrls,
            name ?? '',
            noteList,
          )
          // A click/tap popup (not a hover tooltip). Leaflet's default autoClose
          // keeps only one waypoint popup open at a time.
          ;(l as L.Marker).unbindTooltip().bindPopup(content, {
            className: 'gpx-waypoint-popup',
            offset: [0, -18],
          })
        }
        layer.eachLayer(bindToMarker)
      }
    })

    layerRef.current = layer

    return () => {
      cancelled = true
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [url, color, map, showWaypoints])

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
  waypointNotes,
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
    Record<number, ElevationPoint[]>
  >({})
  const [elevationCursor, setElevationCursor] = useState<{
    lat: number
    lon: number
    color: string
  } | null>(null)
  const [focusedWaypoint, setFocusedWaypoint] = useState<Waypoint | null>(null)
  const [expandedByIndex, setExpandedByIndex] = useState<
    Record<number, number | null>
  >({})
  // Fullscreen gallery opened from a waypoint popup (its images + current one).
  const [lightbox, setLightbox] = useState<{
    images: string[]
    index: number
  } | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  function lightboxStep(delta: number) {
    setLightbox(
      (lb) =>
        lb && {
          images: lb.images,
          index: (lb.index + delta + lb.images.length) % lb.images.length,
        },
    )
  }

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      else if (e.key === 'ArrowRight') lightboxStep(1)
      else if (e.key === 'ArrowLeft') lightboxStep(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox])

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
      axios
        .get<string>(track.url, { responseType: 'text' })
        .then(({ data: text }) => {
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
              showWaypoints={track.showWaypoints ?? showWaypoints ?? false}
              waypointImages={track.waypointImages ?? waypointImages}
              waypointNotes={track.waypointNotes ?? waypointNotes}
              onImageZoom={(images, index) => setLightbox({ images, index })}
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
          {elevationCursor && (
            <CircleMarker
              center={[elevationCursor.lat, elevationCursor.lon]}
              radius={4}
              pathOptions={{
                color: elevationCursor.color,
                fillColor: '#fff',
                fillOpacity: 1,
                weight: 2,
              }}
              data-testid="elevation-cursor"
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

      {resolvedTracks.map((track, i) => {
        if (!track.showElevation) return null
        if (!(visibleTracks[i] ?? /* istanbul ignore next */ true)) return null
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
            onHoverPoint={(lat, lon, clr) =>
              setElevationCursor({ lat, lon, color: clr })
            }
            onHoverEnd={() => setElevationCursor(null)}
          />
        )
      })}

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
                    const wptImages =
                      effectiveImages?.[String(i)] ??
                      effectiveImages?.[wpt.name]
                    const hasImage = !!wptImages?.length
                    // A desc may hold several notes (one per line), some nested
                    // via leading indentation; show each on its own row at its
                    // level rather than a single run-on line.
                    const noteLines = parseWaypointNotes(wpt.desc)
                    const hasDesc = noteLines.length > 0
                    const hasDetails = hasImage || hasDesc
                    // The row indicator tells you what's inside before expanding:
                    // a note, an image, or both.
                    const indicatorKind =
                      hasImage && hasDesc ? 'both' : hasImage ? 'image' : 'note'
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
                                data-kind={indicatorKind}
                              >
                                {hasDesc && <NoteIcon />}
                                {hasImage && <PhotoIcon />}
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
                              {wptImages && wptImages.length > 0 && (
                                <WaypointImageGallery
                                  images={wptImages}
                                  alt={wpt.name}
                                />
                              )}
                              {hasDesc && (
                                <StyledWaypointNotes>
                                  {noteLines.map((note, j) => (
                                    <li
                                      key={j}
                                      data-level={note.level}
                                      style={{
                                        marginLeft: `${note.level * 0.9}rem`,
                                      }}
                                    >
                                      {note.text}
                                    </li>
                                  ))}
                                </StyledWaypointNotes>
                              )}
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

      {lightbox !== null &&
        createPortal(
          <StyledLightbox
            data-testid="gpx-lightbox"
            onClick={() => setLightbox(null)}
          >
            <StyledLightboxClose
              type="button"
              aria-label="Close"
              data-testid="gpx-lightbox-close"
              onClick={() => setLightbox(null)}
            >
              ×
            </StyledLightboxClose>
            <img
              src={lightbox.images[lightbox.index]}
              alt=""
              data-testid="gpx-lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
            {lightbox.images.length > 1 && (
              <StyledLightboxNav>
                <button
                  type="button"
                  aria-label="Previous image"
                  data-testid="gpx-lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    lightboxStep(-1)
                  }}
                >
                  <ChevronIcon />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  data-testid="gpx-lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation()
                    lightboxStep(1)
                  }}
                >
                  <ChevronIcon />
                </button>
              </StyledLightboxNav>
            )}
          </StyledLightbox>,
          document.body,
        )}
    </StyledGpxMap>
  )
}

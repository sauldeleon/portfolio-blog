'use client'

import L, { type LeafletEvent, type LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'

import {
  type GpxTrack,
  type GpxWaypoint,
  type LatLon,
  MAP_ICON_ANCHOR,
  MAP_ICON_SIZE,
  TILE_PROVIDERS,
  WPT_ICON_URLS,
} from '@sdlgr/gpx-tools'
import { TileLayerSwitcher } from '@sdlgr/gpx-ui'

import { useClientTranslation } from '@web/i18n/client'

import type {
  EditorTab,
  PointSelection,
  SegmentRef,
} from '../TrackWorkspace/TrackWorkspace'
import { StyledHint, StyledMapWrapper } from './TrackEditorMap.styles'

/** Above this many vertices in view, markers are hidden to keep dragging smooth. */
export const MAX_VISIBLE_VERTICES = 2000

/**
 * Tiles stop at the provider's native zoom; beyond it Leaflet upscales the
 * last level so dense recordings can still be spread apart.
 */
export const MAX_MAP_ZOOM = 22

const COLORS = {
  original: '#9ca3af',
  active: '#e63946',
  inactive: '#3a86ff',
  preview: '#06d6a0',
  selection: '#ffdd83',
}

interface Viewport {
  south: number
  west: number
  north: number
  east: number
}

function toLatLng(p: LatLon): [number, number] {
  return [p.lat, p.lon]
}

/**
 * Frames the track, and keeps re-framing it while the layout settles (the
 * editor sizes itself after mounting) until the user pans or zooms.
 */
function FitBounds({ points }: { points: LatLon[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    const container = map.getContainer()
    let userMoved = false
    const markUserMoved = () => {
      userMoved = true
    }
    // A zero-sized container would zoom all the way in.
    function fit() {
      const size = map.getSize()
      if (userMoved || size.x === 0 || size.y === 0) return
      map.fitBounds(L.latLngBounds(points.map(toLatLng)), { padding: [24, 24] })
    }
    fit()
    map.on('resize', fit)
    container.addEventListener('pointerdown', markUserMoved)
    container.addEventListener('wheel', markUserMoved)
    return () => {
      map.off('resize', fit)
      container.removeEventListener('pointerdown', markUserMoved)
      container.removeEventListener('wheel', markUserMoved)
    }
  }, [map, points])
  return null
}

/** Pans to a waypoint when it gets selected (not when it is dragged). */
function FocusWaypoint({
  waypoints,
  selectedId,
}: {
  waypoints: GpxWaypoint[]
  selectedId: string | null
}) {
  const map = useMap()
  useEffect(() => {
    const target = waypoints.find((w) => w.id === selectedId)
    if (target) map.panTo(toLatLng(target))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectedId])
  return null
}

/** Leaflet does not notice container resizes (e.g. the panel folding). */
function InvalidateOnResize() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}

/** Pans to a point picked outside the map (e.g. on the elevation profile). */
function FocusPoint({ point }: { point: LatLon | null }) {
  const map = useMap()
  useEffect(() => {
    if (point) map.panTo(toLatLng(point))
  }, [map, point])
  return null
}

function MapEvents({
  onViewportChange,
  onClick,
}: {
  onViewportChange: (viewport: Viewport) => void
  onClick: (at: LatLon) => void
}) {
  const map = useMapEvents({
    moveend: () => report(),
    click: (e: LeafletMouseEvent) =>
      onClick({ lat: e.latlng.lat, lon: e.latlng.lng }),
  })
  function report() {
    const bounds = map.getBounds()
    onViewportChange({
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
    })
  }
  useEffect(() => {
    report()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function draggedTo(e: LeafletEvent): LatLon {
  const { lat, lng } = (e.target as L.Marker).getLatLng()
  return { lat, lon: lng }
}

export interface TrackEditorMapProps {
  original: GpxTrack[]
  tracks: GpxTrack[]
  preview: GpxTrack[] | null
  waypoints: GpxWaypoint[]
  mode: EditorTab
  activeSegment: SegmentRef
  selection: PointSelection | null
  /** Map clicks are captured (inserting a point or a waypoint). */
  clickMode: boolean
  selectedWaypointId: string | null
  /** Point hovered on the elevation profile. */
  hoverPoint?: LatLon | null
  /** Point to pan to; a new object pans again. */
  focusPoint?: LatLon | null
  onVertexClick: (index: number, extend: boolean) => void
  onVertexMove: (index: number, to: LatLon) => void
  onMapClick: (at: LatLon) => void
  onWaypointClick: (id: string) => void
  onWaypointMove: (id: string, to: LatLon) => void
}

export function TrackEditorMap({
  original,
  tracks,
  preview,
  waypoints,
  mode,
  activeSegment,
  selection,
  clickMode,
  selectedWaypointId,
  hoverPoint = null,
  focusPoint = null,
  onVertexClick,
  onVertexMove,
  onMapClick,
  onWaypointClick,
  onWaypointMove,
}: TrackEditorMapProps) {
  const { t } = useClientTranslation('admin')
  const [providerIndex, setProviderIndex] = useState(0)
  const [viewport, setViewport] = useState<Viewport | null>(null)
  const provider = TILE_PROVIDERS[providerIndex]

  const allOriginalPoints = useMemo(
    () => original.flatMap((tr) => tr.segments.flatMap((s) => s.points)),
    [original],
  )
  const activePoints = useMemo(
    () =>
      tracks[activeSegment.track]?.segments[activeSegment.segment]?.points ??
      [],
    [tracks, activeSegment],
  )

  const handleIcon = useMemo(
    () =>
      L.divIcon({
        className: 'track-vertex-handle',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    [],
  )

  // One Leaflet icon per distinct image, shared by every waypoint using it.
  const waypointIcons = useMemo(
    () =>
      new Map(
        Array.from(new Set(Object.values(WPT_ICON_URLS))).map((url) => [
          url,
          L.icon({
            iconUrl: url,
            iconSize: MAP_ICON_SIZE,
            iconAnchor: MAP_ICON_ANCHOR,
          }),
        ]),
      ),
    [],
  )
  const waypointIcon = (sym: string) =>
    waypointIcons.get(WPT_ICON_URLS[sym] ?? WPT_ICON_URLS['']) as L.Icon

  const visibleVertices = useMemo(() => {
    if (mode !== 'edit' || !viewport) return []
    const indices: number[] = []
    activePoints.forEach((p, i) => {
      if (
        p.lat >= viewport.south &&
        p.lat <= viewport.north &&
        p.lon >= viewport.west &&
        p.lon <= viewport.east
      ) {
        indices.push(i)
      }
    })
    return indices
  }, [mode, viewport, activePoints])
  const tooManyVertices = visibleVertices.length > MAX_VISIBLE_VERTICES

  const lo = selection ? Math.min(selection.from, selection.to) : -1
  const hi = selection ? Math.max(selection.from, selection.to) : -1

  return (
    <StyledMapWrapper $crosshair={clickMode} data-testid="track-editor-map">
      <MapContainer
        center={[42, 0]}
        zoom={13}
        maxZoom={MAX_MAP_ZOOM}
        scrollWheelZoom
        doubleClickZoom={!clickMode}
        // Vector layers on canvas: thousands of vertices stay cheap.
        preferCanvas
      >
        <TileLayer
          key={provider.id}
          url={provider.url}
          attribution={provider.attribution}
          maxNativeZoom={provider.maxZoom}
          maxZoom={MAX_MAP_ZOOM}
        />
        <FitBounds points={allOriginalPoints} />
        <InvalidateOnResize />
        <FocusWaypoint waypoints={waypoints} selectedId={selectedWaypointId} />
        <FocusPoint point={focusPoint} />
        <MapEvents
          onViewportChange={setViewport}
          onClick={(at) => {
            if (clickMode) onMapClick(at)
          }}
        />
        {original.flatMap((tr, ti) =>
          tr.segments.map((s, si) => (
            <Polyline
              key={`original-${ti}-${si}`}
              positions={s.points.map(toLatLng)}
              pathOptions={{
                color: COLORS.original,
                weight: 2,
                opacity: 0.6,
                dashArray: '4 6',
              }}
            />
          )),
        )}
        {tracks.flatMap((tr, ti) =>
          tr.segments.map((s, si) => {
            const isActive =
              ti === activeSegment.track && si === activeSegment.segment
            return (
              <Polyline
                key={`track-${ti}-${si}`}
                positions={s.points.map(toLatLng)}
                pathOptions={{
                  color: isActive ? COLORS.active : COLORS.inactive,
                  weight: 3,
                  opacity: preview ? 0.35 : 0.9,
                }}
              />
            )
          }),
        )}
        {preview?.flatMap((tr, ti) =>
          tr.segments.map((s, si) => (
            <Polyline
              key={`preview-${ti}-${si}`}
              positions={s.points.map(toLatLng)}
              pathOptions={{ color: COLORS.preview, weight: 3 }}
            />
          )),
        )}
        {mode === 'edit' && hi > lo && (
          <Polyline
            positions={activePoints.slice(lo, hi + 1).map(toLatLng)}
            pathOptions={{ color: COLORS.selection, weight: 7, opacity: 0.7 }}
          />
        )}
        {!tooManyVertices &&
          visibleVertices.map((i) => {
            const selected = i >= lo && i <= hi
            return (
              <CircleMarker
                key={`vertex-${i}`}
                center={toLatLng(activePoints[i])}
                radius={selected ? 5 : 4}
                bubblingMouseEvents={false}
                pathOptions={{
                  color: selected ? '#000' : COLORS.active,
                  weight: 2,
                  fillColor: selected ? COLORS.selection : '#fff',
                  fillOpacity: 1,
                }}
                eventHandlers={{
                  click: (e: LeafletMouseEvent) =>
                    onVertexClick(i, e.originalEvent.shiftKey),
                }}
                data-testid="vertex"
              />
            )
          })}
        {mode === 'edit' && selection && lo === hi && activePoints[lo] && (
          // A single selected point gets a draggable handle.
          <Marker
            key={`handle-${lo}`}
            position={toLatLng(activePoints[lo])}
            icon={handleIcon}
            draggable
            eventHandlers={{
              dragend: (e: LeafletEvent) => onVertexMove(lo, draggedTo(e)),
            }}
          />
        )}
        {hoverPoint && (
          <CircleMarker
            center={toLatLng(hoverPoint)}
            radius={7}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: COLORS.active,
              fillOpacity: 1,
            }}
            data-testid="hover-marker"
          />
        )}
        {waypoints.map((w) => (
          <Marker
            key={w.id}
            position={toLatLng(w)}
            icon={waypointIcon(w.sym)}
            title={w.name}
            opacity={
              mode !== 'waypoints' ||
              !selectedWaypointId ||
              w.id === selectedWaypointId
                ? 1
                : 0.5
            }
            draggable={mode === 'waypoints'}
            eventHandlers={{
              click: () => onWaypointClick(w.id),
              dragend: (e: LeafletEvent) => onWaypointMove(w.id, draggedTo(e)),
            }}
          />
        ))}
      </MapContainer>
      <TileLayerSwitcher
        providers={TILE_PROVIDERS}
        activeIndex={providerIndex}
        onChange={setProviderIndex}
        testIdPrefix="editor-tile"
      />
      {mode === 'edit' && tooManyVertices && (
        <StyledHint data-testid="zoom-hint">
          {t('tracks.edit.zoomHint', { count: visibleVertices.length })}
        </StyledHint>
      )}
    </StyledMapWrapper>
  )
}

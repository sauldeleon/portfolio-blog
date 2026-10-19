import { computeStats, haversine } from '@sdlgr/gpx-tools'

import { findCols, findPeaks } from './primitives'
import type { RouteLandmark } from './types'
import { resolveCategory } from './waypoints'

/**
 * GPX parsing helpers. Regex-based so they run unchanged on the server
 * (no DOM). GPX times are UTC; display values are shown in the routes' local
 * time (`CARD_TIME_ZONE`), whatever the server or browser timezone is.
 */

/** Where the routes are: clock times and dates on the cards use this zone. */
export const CARD_TIME_ZONE = 'Europe/Madrid'

/** Start and end within this distance (or 2% of the route) make a loop. */
const LOOP_MAX_GAP_METERS = 200

export type RouteShape = 'loop' | 'linear'

export interface GpxMetrics {
  /** First fix date, formatted as `dd MMM yyyy` (matches CARD_DATE_FORMAT). */
  date: string
  /** Clock time of the first fix, `HH:MM`. */
  startTime: string
  /** Clock time of the last fix, `HH:MM`. */
  endTime: string
  /** Time spent moving, `H:MM`. */
  movingTime: string
  /** Time spent stopped, `H:MM`. */
  stoppedTime: string
  /** Total elapsed time, `H:MM`. */
  totalTime: string
  /** Total distance, e.g. `12.4 km`. */
  distanceKm: string
  /** Total ascent (D+), e.g. `1200 m`. */
  ascent: string
  /** Total descent (D−), e.g. `1200 m`. */
  descent: string
  /** Downsampled elevation series used to draw the card profile. */
  elevation: number[]
  /** Whether the track ends where it started; null without a track. */
  shape: RouteShape | null
  /** Summits and cols on the profile, named after nearby GPX waypoints. */
  landmarks: RouteLandmark[]
  /** Set by the API when OpenStreetMap could not be asked for names. */
  placesUnavailable?: boolean
}

export interface TrackPoint {
  lat: number
  lon: number
  ele?: number
  /** Epoch milliseconds (UTC) for duration math. */
  time?: number
  /** Original ISO string for timezone-safe display formatting. */
  iso?: string
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const MAX_PROFILE_POINTS = 80
/**
 * Slowest pace (m/s, about 0.7 km/h) that still counts as moving. A speed,
 * not a distance: cleaned tracks drop the points of a stop, so one long
 * step can hide minutes spent standing still.
 */
const MOVING_MIN_SPEED = 0.2

const TRKPT_RE = /<trkpt\b([^>]*?)(?:\/>|>([\s\S]*?)<\/trkpt>)/g

/** `dd MMM yyyy` from an ISO string, without timezone conversion. */
const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i

const LOCAL_PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: CARD_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/**
 * Date and clock parts of a GPX time in `CARD_TIME_ZONE`. A time without a
 * zone is already local, so it is read as written.
 */
function localParts(
  iso: string,
  ms: number,
): { y: string; mo: string; d: string; h: string; mi: string } | null {
  if (HAS_ZONE.test(iso.trim())) {
    const parts = Object.fromEntries(
      LOCAL_PARTS.formatToParts(new Date(ms)).map((p) => [p.type, p.value]),
    )
    return {
      y: parts.year,
      mo: parts.month,
      d: parts.day,
      h: parts.hour,
      mi: parts.minute,
    }
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso)
  return m ? { y: m[1], mo: m[2], d: m[3], h: m[4], mi: m[5] } : null
}

function isoDate(iso: string, ms: number): string {
  const p = localParts(iso, ms)
  return p ? `${p.d} ${MONTHS[Number(p.mo) - 1]} ${p.y}` : ''
}

/** `HH:MM` of a GPX time, in `CARD_TIME_ZONE`. */
function isoClock(iso: string, ms: number): string {
  const p = localParts(iso, ms)
  return p?.h ? `${p.h}:${p.mi}` : ''
}

/** `H:MM` duration from a millisecond span. */
function duration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(totalMinutes / 60)
  const mm = String(totalMinutes % 60).padStart(2, '0')
  return `${h}:${mm}`
}

/** Indices that evenly sample `n` items down to at most `max`. */
function sampleIndices(n: number, max: number): number[] {
  if (n <= max) return Array.from({ length: n }, (_, i) => i)
  const step = (n - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => Math.round(i * step))
}

/** A GPX waypoint this close to the track is drawn on its profile. */
const WAYPOINT_TRACK_RADIUS = 150

/** A detected summit or col this close to a GPX waypoint is that waypoint. */
const SAME_SPOT_RADIUS = 100

/** Names that make a waypoint a col, whatever its symbol. */
const COL_NAME = /\b(collad[oa]|puerto|horcada|brecha|portillo|paso)\b/i

const WPT_RE = /<wpt\b([^>]*?)>([\s\S]*?)<\/wpt>/g

export interface NamedWaypoint {
  lat: number
  lon: number
  name: string
  ele?: number
  sym?: string
}

/** Named `<wpt>` of a GPX document. */
export function parseNamedWaypoints(xml: string): NamedWaypoint[] {
  const waypoints: NamedWaypoint[] = []
  for (const match of xml.matchAll(WPT_RE)) {
    const lat = Number(/\blat="([^"]+)"/.exec(match[1])?.[1])
    const lon = Number(/\blon="([^"]+)"/.exec(match[1])?.[1])
    const name = /<name>([^<]*)<\/name>/.exec(match[2])?.[1].trim()
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !name) continue
    const waypoint: NamedWaypoint = { lat, lon, name: decodeXml(name) }
    const ele = Number(/<ele>([^<]+)<\/ele>/.exec(match[2])?.[1])
    if (Number.isFinite(ele)) waypoint.ele = ele
    const sym = /<sym>([^<]*)<\/sym>/.exec(match[2])?.[1].trim()
    if (sym) waypoint.sym = decodeXml(sym)
    waypoints.push(waypoint)
  }
  return waypoints
}

function decodeXml(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

/** Index of the item closest to `target` (by `distance`). */
function closest<T>(items: T[], distance: (item: T) => number): number {
  let best = 0
  let bestDistance = Infinity
  items.forEach((item, i) => {
    const d = distance(item)
    if (d < bestDistance) {
      bestDistance = d
      best = i
    }
  })
  return best
}

/** The GPX waypoints lying on the track, placed on the sampled profile. */
function waypointLandmarks(
  points: Array<TrackPoint & { ele: number }>,
  samples: number[],
  waypoints: NamedWaypoint[],
): RouteLandmark[] {
  return waypoints.flatMap((w) => {
    const j = closest(points, (p) => haversine(p, w))
    if (haversine(points[j], w) > WAYPOINT_TRACK_RADIUS) return []
    const category = resolveCategory(w.name, w.sym)
    const kind: RouteLandmark['kind'] =
      category === 'summit' ? 'peak' : COL_NAME.test(w.name) ? 'col' : 'point'
    const landmark: RouteLandmark = {
      kind,
      index: closest(samples, (s) => Math.abs(s - j)),
      ele: Math.round(w.ele ?? points[j].ele),
      lat: w.lat,
      lon: w.lon,
      name: w.name,
    }
    if (kind === 'point') landmark.category = category
    return [landmark]
  })
}

/**
 * Summits and cols of the sampled profile. Each is moved to the real highest
 * (or lowest) track point around its sample, so its altitude and position are
 * exact.
 */
function detectedLandmarks(
  points: Array<TrackPoint & { ele: number }>,
  samples: number[],
  elevation: number[],
): RouteLandmark[] {
  const found: Array<readonly [RouteLandmark['kind'], number]> = [
    ...findPeaks(elevation, 4).map((i) => ['peak', i] as const),
    ...findCols(elevation, 3).map((i) => ['col', i] as const),
  ]
  return found.map(([kind, s]) => {
    const from = samples[Math.max(0, s - 1)]
    const to = samples[Math.min(samples.length - 1, s + 1)]
    let best = samples[s]
    for (let j = from; j <= to; j++) {
      const better =
        kind === 'peak'
          ? points[j].ele > points[best].ele
          : points[j].ele < points[best].ele
      if (better) best = j
    }
    const { lat, lon, ele } = points[best]
    return { kind, index: s, ele: Math.round(ele), lat, lon }
  })
}

/**
 * Every spot worth pointing out on the profile, in route order: all the GPX
 * waypoints on the track, plus the detected summits and cols no waypoint
 * already marks (those get their names from OpenStreetMap later).
 */
function findLandmarks(
  points: Array<TrackPoint & { ele: number }>,
  samples: number[],
  elevation: number[],
  waypoints: NamedWaypoint[],
): RouteLandmark[] {
  const fromWaypoints = waypointLandmarks(points, samples, waypoints)
  const detected = detectedLandmarks(points, samples, elevation).filter(
    (d) => !fromWaypoints.some((w) => haversine(w, d) <= SAME_SPOT_RADIUS),
  )
  return [...fromWaypoints, ...detected].sort((a, b) => a.index - b.index)
}

/** Extract `<trkpt>` rows from a GPX document. */
export function parseTrackPoints(xml: string): TrackPoint[] {
  const points: TrackPoint[] = []
  for (const match of xml.matchAll(TRKPT_RE)) {
    const attrs = match[1]
    const inner = match[2] ?? ''
    const lat = Number(/\blat="([^"]+)"/.exec(attrs)?.[1])
    const lon = Number(/\blon="([^"]+)"/.exec(attrs)?.[1])
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    const point: TrackPoint = { lat, lon }
    const ele = Number(/<ele>([^<]+)<\/ele>/.exec(inner)?.[1])
    if (Number.isFinite(ele)) point.ele = ele
    const iso = /<time>([^<]+)<\/time>/.exec(inner)?.[1]
    if (iso) {
      const ms = Date.parse(iso)
      if (!Number.isNaN(ms)) {
        point.iso = iso
        point.time = ms
      }
    }
    points.push(point)
  }
  return points
}

/** Loop when the track ends close to where it started, else linear. */
function routeShape(points: TrackPoint[], distance: number): RouteShape {
  const gap = haversine(points[0], points[points.length - 1])
  return gap <= Math.max(LOOP_MAX_GAP_METERS, distance * 0.02)
    ? 'loop'
    : 'linear'
}

/** Parse a GPX document into card metrics. Throws if it has no track. */
export function parseGpx(xml: string): GpxMetrics {
  const points = parseTrackPoints(xml)
  if (points.length === 0) {
    throw new Error('No track points found')
  }

  let distance = 0
  let movingMs = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const step = haversine(prev, curr)
    distance += step
    if (prev.time !== undefined && curr.time !== undefined) {
      const ms = curr.time - prev.time
      if (ms > 0 && step / (ms / 1000) >= MOVING_MIN_SPEED) movingMs += ms
    }
  }

  const timed = points.filter(
    (p): p is TrackPoint & { time: number } => p.time !== undefined,
  )
  const hasTimes = timed.length >= 2
  const first = timed.length > 0 ? timed[0] : undefined
  const last = timed.length > 0 ? timed[timed.length - 1] : undefined
  const totalMs = hasTimes ? timed[timed.length - 1].time - timed[0].time : 0

  // Same elevation-noise threshold as the track editor, so a card and the
  // editor report the same D+/D− for a given file.
  const { ascent, descent } = computeStats(
    points.map((p) => ({
      lat: p.lat,
      lon: p.lon,
      ele: p.ele ?? null,
      time: p.time ?? null,
    })),
  )

  const withEle = points.filter(
    (p): p is TrackPoint & { ele: number } => p.ele !== undefined,
  )
  const samples = sampleIndices(withEle.length, MAX_PROFILE_POINTS)
  const elevation = samples.map((i) => Math.round(withEle[i].ele))

  return {
    date: first ? isoDate(first.iso as string, first.time) : '',
    startTime: first ? isoClock(first.iso as string, first.time) : '',
    endTime: last ? isoClock(last.iso as string, last.time) : '',
    movingTime: hasTimes ? duration(movingMs) : '',
    stoppedTime: hasTimes ? duration(Math.max(0, totalMs - movingMs)) : '',
    totalTime: hasTimes ? duration(totalMs) : '',
    distanceKm: `${(distance / 1000).toFixed(1)} km`,
    ascent: `${Math.round(ascent)} m`,
    descent: `${Math.round(descent)} m`,
    elevation,
    shape: routeShape(points, distance),
    landmarks: findLandmarks(
      withEle,
      samples,
      elevation,
      parseNamedWaypoints(xml),
    ),
  }
}

/**
 * GPX parsing helpers. Regex-based so they run unchanged on the server
 * (no DOM) and stay timezone-deterministic by reading ISO time parts
 * directly instead of constructing local `Date`s for display values.
 */

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
/** Minimum horizontal step (m) between samples to count as "moving". */
const MOVING_MIN_METERS = 1

const TRKPT_RE = /<trkpt\b([^>]*?)(?:\/>|>([\s\S]*?)<\/trkpt>)/g

/** Great-circle distance between two points, in metres. */
function haversine(a: TrackPoint, b: TrackPoint): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** `dd MMM yyyy` from an ISO string, without timezone conversion. */
function isoDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return ''
  return `${m[3]} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`
}

/** `HH:MM` from an ISO string, without timezone conversion. */
function isoClock(iso: string): string {
  const m = /T(\d{2}):(\d{2})/.exec(iso)
  return m ? `${m[1]}:${m[2]}` : ''
}

/** `H:MM` duration from a millisecond span. */
function duration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(totalMinutes / 60)
  const mm = String(totalMinutes % 60).padStart(2, '0')
  return `${h}:${mm}`
}

/** Evenly sample a series down to at most `max` points. */
function downsample(values: number[], max: number): number[] {
  if (values.length <= max) return values
  const step = (values.length - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => values[Math.round(i * step)])
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

/** Parse a GPX document into card metrics. Throws if it has no track. */
export function parseGpx(xml: string): GpxMetrics {
  const points = parseTrackPoints(xml)
  if (points.length === 0) {
    throw new Error('No track points found')
  }

  let distance = 0
  let ascent = 0
  let descent = 0
  let movingMs = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const step = haversine(prev, curr)
    distance += step
    if (prev.ele !== undefined && curr.ele !== undefined) {
      const delta = curr.ele - prev.ele
      if (delta > 0) ascent += delta
      else descent -= delta
    }
    if (
      prev.time !== undefined &&
      curr.time !== undefined &&
      step >= MOVING_MIN_METERS
    ) {
      movingMs += curr.time - prev.time
    }
  }

  const timed = points.filter(
    (p): p is TrackPoint & { time: number } => p.time !== undefined,
  )
  const hasTimes = timed.length >= 2
  const firstIso = timed.length > 0 ? timed[0].iso : undefined
  const lastIso = timed.length > 0 ? timed[timed.length - 1].iso : undefined
  const totalMs = hasTimes ? timed[timed.length - 1].time - timed[0].time : 0

  const eles: number[] = []
  for (const p of points) {
    if (p.ele !== undefined) eles.push(Math.round(p.ele))
  }

  return {
    date: firstIso ? isoDate(firstIso) : '',
    startTime: firstIso ? isoClock(firstIso) : '',
    endTime: lastIso ? isoClock(lastIso) : '',
    movingTime: hasTimes ? duration(movingMs) : '',
    stoppedTime: hasTimes ? duration(Math.max(0, totalMs - movingMs)) : '',
    totalTime: hasTimes ? duration(totalMs) : '',
    distanceKm: `${(distance / 1000).toFixed(1)} km`,
    ascent: `${Math.round(ascent)} m`,
    descent: `${Math.round(descent)} m`,
    elevation: downsample(eles, MAX_PROFILE_POINTS),
  }
}

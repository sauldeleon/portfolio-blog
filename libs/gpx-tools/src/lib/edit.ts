import { haversine, project, projectOnSegment } from './geo'
import type { GpxPoint, LatLon } from './types'

/** Index of the point closest to `target`, or -1 for an empty list. */
export function nearestPointIndex(points: LatLon[], target: LatLon): number {
  let best = -1
  let bestDist = Infinity
  points.forEach((p, i) => {
    const d = haversine(p, target)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  return best
}

/**
 * Finds the track segment (between `index` and `index + 1`) closest to
 * `target`, with `t` the position along it (0–1).
 */
export function nearestSegment(
  points: LatLon[],
  target: LatLon,
): { index: number; t: number; distance: number } | null {
  if (points.length < 2) return null
  const refLat = target.lat
  const p = project(target, refLat)
  let best = { index: 0, t: 0, distSq: Infinity }
  for (let i = 0; i < points.length - 1; i++) {
    const { distSq, t } = projectOnSegment(
      p,
      project(points[i], refLat),
      project(points[i + 1], refLat),
    )
    if (distSq < best.distSq) best = { index: i, t, distSq }
  }
  return { index: best.index, t: best.t, distance: Math.sqrt(best.distSq) }
}

function lerp(a: number | null, b: number | null, t: number): number | null {
  return a === null || b === null ? null : a + (b - a) * t
}

export function movePoint(
  points: GpxPoint[],
  index: number,
  to: LatLon,
): GpxPoint[] {
  return points.map((p, i) =>
    i === index ? { ...p, lat: to.lat, lon: to.lon } : p,
  )
}

/** Removes points `from`..`to` (inclusive, order-insensitive). */
export function deletePoints(
  points: GpxPoint[],
  from: number,
  to: number = from,
): GpxPoint[] {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  return points.filter((_, i) => i < lo || i > hi)
}

/**
 * Inserts a new point at `at` on the segment closest to it. Elevation and time
 * are interpolated from the segment ends.
 */
export function insertPoint(points: GpxPoint[], at: LatLon): GpxPoint[] {
  const segment = nearestSegment(points, at)
  if (!segment)
    return [...points, { lat: at.lat, lon: at.lon, ele: null, time: null }]
  const a = points[segment.index]
  const b = points[segment.index + 1]
  const time = lerp(a.time, b.time, segment.t)
  const point: GpxPoint = {
    lat: at.lat,
    lon: at.lon,
    ele: lerp(a.ele, b.ele, segment.t),
    time: time === null ? null : Math.round(time),
  }
  return [
    ...points.slice(0, segment.index + 1),
    point,
    ...points.slice(segment.index + 1),
  ]
}

/** Elevation of the track point nearest to `target`. */
export function elevationAt(points: GpxPoint[], target: LatLon): number | null {
  const index = nearestPointIndex(points, target)
  return index === -1 ? null : points[index].ele
}

/** Returns a copy of `items` with the element at `from` moved to `to`. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || to < 0 || to >= items.length) return items
  const result = [...items]
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}

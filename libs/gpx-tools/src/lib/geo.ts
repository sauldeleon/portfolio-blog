import type { LatLon } from './types'

const EARTH_RADIUS_M = 6371008.8
const DEG = Math.PI / 180

/** Great-circle distance in metres. */
export function haversine(a: LatLon, b: LatLon): number {
  const dLat = (b.lat - a.lat) * DEG
  const dLon = (b.lon - a.lon) * DEG
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

export interface XY {
  x: number
  y: number
}

/**
 * Local equirectangular projection in metres. Accurate enough at track scale
 * (a few km) and far cheaper than geodesic maths inside the simplifiers.
 */
export function project(p: LatLon, refLat: number): XY {
  return {
    x: p.lon * DEG * EARTH_RADIUS_M * Math.cos(refLat * DEG),
    y: p.lat * DEG * EARTH_RADIUS_M,
  }
}

/** Squared distance from `p` to segment `a`–`b`, plus the projection factor. */
export function projectOnSegment(
  p: XY,
  a: XY,
  b: XY,
): { distSq: number; t: number } {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  const t =
    lenSq === 0
      ? 0
      : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq))
  const cx = a.x + t * dx - p.x
  const cy = a.y + t * dy - p.y
  return { distSq: cx * cx + cy * cy, t }
}

/** Area in m² of the triangle formed by three projected points. */
export function triangleArea(a: XY, b: XY, c: XY): number {
  return Math.abs(
    (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2,
  )
}

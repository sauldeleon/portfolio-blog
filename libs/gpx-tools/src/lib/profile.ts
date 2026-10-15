import { haversine } from './geo'
import type { LatLon } from './types'

/** Distance in metres from the first point to each point. */
export function cumulativeDistances(points: LatLon[]): number[] {
  const result: number[] = []
  points.forEach((p, i) => {
    result.push(i === 0 ? 0 : result[i - 1] + haversine(points[i - 1], p))
  })
  return result
}

export interface ProfilePoint {
  /** Index of the track point this sample comes from. */
  index: number
  /** Metres from the start. */
  distance: number
  ele: number
}

/**
 * Elevation samples for charting, skipping points without elevation and
 * downsampled to at most `maxSamples` (always keeping the last one).
 */
export function elevationProfile(
  points: Array<LatLon & { ele: number | null }>,
  maxSamples = 600,
): ProfilePoint[] {
  const distances = cumulativeDistances(points)
  const samples: ProfilePoint[] = []
  points.forEach((p, i) => {
    if (p.ele !== null)
      samples.push({ index: i, distance: distances[i], ele: p.ele })
  })
  if (samples.length <= maxSamples) return samples
  const step = Math.ceil(samples.length / maxSamples)
  return samples.filter((_, i) => i % step === 0 || i === samples.length - 1)
}

/** Index of the point whose distance from the start is closest to `metres`. */
export function indexAtDistance(distances: number[], metres: number): number {
  let best = 0
  distances.forEach((d, i) => {
    if (Math.abs(d - metres) < Math.abs(distances[best] - metres)) best = i
  })
  return best
}

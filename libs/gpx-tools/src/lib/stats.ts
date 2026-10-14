import { haversine } from './geo'
import type { GpxPoint } from './types'

export interface TrackStats {
  points: number
  /** Metres. */
  distance: number
  /** Metres. */
  ascent: number
  /** Metres. */
  descent: number
  minEle: number | null
  maxEle: number | null
  /** Seconds, or null when the track carries no timestamps. */
  duration: number | null
}

/**
 * Basic track metrics. Ascent/descent use a hysteresis threshold (metres) so
 * GPS elevation noise does not inflate the totals — the same idea Garmin and
 * Strava apply.
 */
export function computeStats(
  points: GpxPoint[],
  elevationThreshold = 3,
): TrackStats {
  let distance = 0
  let ascent = 0
  let descent = 0
  let minEle: number | null = null
  let maxEle: number | null = null
  let reference: number | null = null
  let firstTime: number | null = null
  let lastTime: number | null = null

  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    if (i > 0) distance += haversine(points[i - 1], p)
    if (p.time !== null) {
      if (firstTime === null) firstTime = p.time
      lastTime = p.time
    }
    if (p.ele === null) continue
    minEle = minEle === null ? p.ele : Math.min(minEle, p.ele)
    maxEle = maxEle === null ? p.ele : Math.max(maxEle, p.ele)
    if (reference === null) {
      reference = p.ele
      continue
    }
    const diff = p.ele - reference
    if (diff >= elevationThreshold) {
      ascent += diff
      reference = p.ele
    } else if (diff <= -elevationThreshold) {
      descent -= diff
      reference = p.ele
    }
  }

  return {
    points: points.length,
    distance,
    ascent,
    descent,
    minEle,
    maxEle,
    duration:
      firstTime !== null && lastTime !== null
        ? (lastTime - firstTime) / 1000
        : null,
  }
}

export function sumStats(stats: TrackStats[]): TrackStats {
  const pickMin = (values: Array<number | null>) => {
    const nums = values.filter((v): v is number => v !== null)
    return nums.length ? Math.min(...nums) : null
  }
  const pickMax = (values: Array<number | null>) => {
    const nums = values.filter((v): v is number => v !== null)
    return nums.length ? Math.max(...nums) : null
  }
  const durations = stats
    .map((s) => s.duration)
    .filter((d): d is number => d !== null)
  return {
    points: stats.reduce((acc, s) => acc + s.points, 0),
    distance: stats.reduce((acc, s) => acc + s.distance, 0),
    ascent: stats.reduce((acc, s) => acc + s.ascent, 0),
    descent: stats.reduce((acc, s) => acc + s.descent, 0),
    minEle: pickMin(stats.map((s) => s.minEle)),
    maxEle: pickMax(stats.map((s) => s.maxEle)),
    duration: durations.length
      ? durations.reduce((acc, d) => acc + d, 0)
      : null,
  }
}

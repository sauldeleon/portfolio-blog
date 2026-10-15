import {
  removeDetourSpikes,
  removeSpeedSpikes,
  removeStops,
  smoothElevation,
  smoothPositions,
  trimEnds,
} from './filters'
import { douglasPeucker, radialDistance, visvalingam } from './simplify'
import type { GpxFile, GpxPoint } from './types'

export type SimplifyAlgorithm = 'douglas-peucker' | 'visvalingam'

export interface CleanOptions {
  trim: { enabled: boolean; start: number; end: number }
  speedSpikes: { enabled: boolean; maxSpeedKmh: number }
  detourSpikes: { enabled: boolean; maxDetour: number }
  stops: { enabled: boolean; radius: number; minDuration: number }
  minDistance: { enabled: boolean; distance: number }
  smoothing: { enabled: boolean; window: number }
  simplify: {
    enabled: boolean
    algorithm: SimplifyAlgorithm
    /** Metres for Douglas–Peucker, m² for Visvalingam–Whyatt. */
    tolerance: number
  }
  elevationSmoothing: { enabled: boolean; window: number }
}

export const DEFAULT_CLEAN_OPTIONS: CleanOptions = {
  trim: { enabled: false, start: 200, end: 200 },
  speedSpikes: { enabled: true, maxSpeedKmh: 30 },
  detourSpikes: { enabled: true, maxDetour: 40 },
  stops: { enabled: false, radius: 10, minDuration: 120 },
  minDistance: { enabled: true, distance: 2 },
  smoothing: { enabled: false, window: 3 },
  simplify: { enabled: true, algorithm: 'douglas-peucker', tolerance: 2 },
  elevationSmoothing: { enabled: false, window: 5 },
}

/**
 * Runs the enabled filters in a fixed order: remove junk first (trim, spikes,
 * stops, duplicates), then smooth, then simplify, then fix elevation.
 */
export function cleanPoints(
  points: GpxPoint[],
  options: CleanOptions,
): GpxPoint[] {
  let result = [...points]
  const { trim, speedSpikes, detourSpikes, stops, minDistance } = options
  const { smoothing, simplify, elevationSmoothing } = options
  if (trim.enabled) result = trimEnds(result, trim.start, trim.end)
  if (speedSpikes.enabled)
    result = removeSpeedSpikes(result, speedSpikes.maxSpeedKmh)
  if (detourSpikes.enabled)
    result = removeDetourSpikes(result, detourSpikes.maxDetour)
  if (stops.enabled)
    result = removeStops(result, stops.radius, stops.minDuration)
  if (minDistance.enabled) result = radialDistance(result, minDistance.distance)
  if (smoothing.enabled) result = smoothPositions(result, smoothing.window)
  if (simplify.enabled) {
    result =
      simplify.algorithm === 'visvalingam'
        ? visvalingam(result, simplify.tolerance)
        : douglasPeucker(result, simplify.tolerance)
  }
  if (elevationSmoothing.enabled)
    result = smoothElevation(result, elevationSmoothing.window)
  return result
}

export function cleanGpx(file: GpxFile, options: CleanOptions): GpxFile {
  return {
    ...file,
    tracks: file.tracks.map((track) => ({
      ...track,
      segments: track.segments.map((segment) => ({
        points: cleanPoints(segment.points, options),
      })),
    })),
  }
}

export interface PointRange {
  from: number
  to: number
}

export interface SectionCleanResult {
  points: GpxPoint[]
  /** Where the cleaned section sits in the returned points. */
  range: PointRange
}

function samePoint(a: GpxPoint, b: GpxPoint): boolean {
  return a.lat === b.lat && a.lon === b.lon && a.time === b.time
}

/**
 * Cleans only the points between `range.from` and `range.to` (inclusive, in
 * either order). Both ends of the section stay put so it still joins the rest
 * of the track, and the privacy trim never runs on a section.
 */
export function cleanSection(
  points: GpxPoint[],
  range: PointRange,
  options: CleanOptions,
): SectionCleanResult {
  const lo = Math.max(0, Math.min(range.from, range.to))
  const hi = Math.min(points.length - 1, Math.max(range.from, range.to))
  if (hi - lo < 2) return { points: [...points], range: { from: lo, to: hi } }
  const section = points.slice(lo, hi + 1)
  const first = section[0]
  const last = section[section.length - 1]
  const cleaned = cleanPoints(section, {
    ...options,
    trim: { ...options.trim, enabled: false },
  })
  const interior = cleaned.filter(
    (p, i) =>
      !(i === 0 && samePoint(p, first)) &&
      !(i === cleaned.length - 1 && samePoint(p, last)),
  )
  const middle = [first, ...interior, last]
  return {
    points: [...points.slice(0, lo), ...middle, ...points.slice(hi + 1)],
    range: { from: lo, to: lo + middle.length - 1 },
  }
}

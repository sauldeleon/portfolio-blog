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

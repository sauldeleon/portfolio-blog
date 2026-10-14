import type { GpxPoint } from './types'

// ~1.11 m per 0.00001° of latitude.
export const METRE = 0.000009

/** Builds a point `north` metres north and `east` metres east of 42°N 0°E. */
export function pt(
  north: number,
  east = 0,
  extra: Partial<GpxPoint> = {},
): GpxPoint {
  return {
    lat: 42 + north * METRE,
    lon: (east * METRE) / Math.cos((42 * Math.PI) / 180),
    ele: null,
    time: null,
    ...extra,
  }
}

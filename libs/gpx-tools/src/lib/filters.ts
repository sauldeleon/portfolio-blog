import { haversine } from './geo'
import type { GpxPoint } from './types'

/**
 * Drops points that would require moving faster than `maxSpeedKmh` from the
 * last kept point — the classic GPS "jump" filter. Points without timestamps
 * are always kept.
 */
export function removeSpeedSpikes(
  points: GpxPoint[],
  maxSpeedKmh: number,
): GpxPoint[] {
  if (points.length < 2 || maxSpeedKmh <= 0) return [...points]
  const maxSpeed = maxSpeedKmh / 3.6
  const kept: GpxPoint[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const last = kept[kept.length - 1]
    const p = points[i]
    if (last.time !== null && p.time !== null && p.time > last.time) {
      const speed = haversine(last, p) / ((p.time - last.time) / 1000)
      if (speed > maxSpeed) continue
    }
    kept.push(p)
  }
  return kept
}

/**
 * Drops out-and-back spikes: a point far (> `maxDetour` m) from both
 * neighbours while the neighbours themselves are close together.
 */
export function removeDetourSpikes(
  points: GpxPoint[],
  maxDetour: number,
): GpxPoint[] {
  if (points.length < 3 || maxDetour <= 0) return [...points]
  const kept: GpxPoint[] = [points[0]]
  for (let i = 1; i < points.length - 1; i++) {
    const prev = kept[kept.length - 1]
    const p = points[i]
    const next = points[i + 1]
    const isSpike =
      haversine(prev, p) > maxDetour &&
      haversine(p, next) > maxDetour &&
      haversine(prev, next) < maxDetour
    if (!isSpike) kept.push(p)
  }
  kept.push(points[points.length - 1])
  return kept
}

/**
 * Collapses stops — runs of points that stay within `radius` metres for at
 * least `minDuration` seconds — down to their first and last point. Without
 * timestamps any run of three or more points counts as a stop.
 */
export function removeStops(
  points: GpxPoint[],
  radius: number,
  minDuration: number,
): GpxPoint[] {
  if (points.length < 3 || radius <= 0) return [...points]
  const kept: GpxPoint[] = []
  let i = 0
  while (i < points.length) {
    const anchor = points[i]
    let j = i
    while (j + 1 < points.length && haversine(anchor, points[j + 1]) <= radius)
      j++
    const start = points[i].time
    const end = points[j].time
    const longEnough =
      start !== null && end !== null
        ? (end - start) / 1000 >= minDuration
        : true
    if (j - i >= 2 && longEnough) {
      kept.push(points[i], points[j])
      i = j + 1
    } else {
      kept.push(points[i])
      i++
    }
  }
  return kept
}

function movingAverage(
  values: Array<number | null>,
  window: number,
): Array<number | null> {
  const half = Math.floor(window / 2)
  return values.map((v, i) => {
    if (v === null || i === 0 || i === values.length - 1) return v
    let sum = 0
    let count = 0
    for (
      let k = Math.max(0, i - half);
      k <= Math.min(values.length - 1, i + half);
      k++
    ) {
      const value = values[k]
      if (value !== null) {
        sum += value
        count++
      }
    }
    return sum / count
  })
}

/** Centred moving average over lat/lon. Endpoints never move. */
export function smoothPositions(
  points: GpxPoint[],
  window: number,
): GpxPoint[] {
  if (points.length < 3 || window < 2) return [...points]
  const lats = movingAverage(
    points.map((p) => p.lat),
    window,
  ) as number[]
  const lons = movingAverage(
    points.map((p) => p.lon),
    window,
  ) as number[]
  return points.map((p, i) => ({ ...p, lat: lats[i], lon: lons[i] }))
}

/** Centred moving average over elevation, skipping points without one. */
export function smoothElevation(
  points: GpxPoint[],
  window: number,
): GpxPoint[] {
  if (points.length < 3 || window < 2) return [...points]
  const eles = movingAverage(
    points.map((p) => p.ele),
    window,
  )
  return points.map((p, i) => ({ ...p, ele: eles[i] }))
}

/**
 * Privacy trim: removes the leading points within `startRadius` metres of the
 * start and the trailing ones within `endRadius` metres of the end. Leaves the
 * track untouched if fewer than two points would survive.
 */
export function trimEnds(
  points: GpxPoint[],
  startRadius: number,
  endRadius: number,
): GpxPoint[] {
  if (points.length < 2) return [...points]
  const first = points[0]
  const last = points[points.length - 1]
  let from = 0
  let to = points.length - 1
  if (startRadius > 0) {
    while (
      from < points.length &&
      haversine(first, points[from]) <= startRadius
    )
      from++
  }
  if (endRadius > 0) {
    while (to >= 0 && haversine(last, points[to]) <= endRadius) to--
  }
  const result = points.slice(from, to + 1)
  return result.length < 2 ? [...points] : result
}

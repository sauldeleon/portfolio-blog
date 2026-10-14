import {
  type XY,
  haversine,
  project,
  projectOnSegment,
  triangleArea,
} from './geo'
import type { LatLon } from './types'

/** Drops points closer than `minDistance` metres to the last kept point. */
export function radialDistance<T extends LatLon>(
  points: T[],
  minDistance: number,
): T[] {
  if (points.length < 3 || minDistance <= 0) return [...points]
  const kept: T[] = [points[0]]
  for (let i = 1; i < points.length - 1; i++) {
    if (haversine(kept[kept.length - 1], points[i]) >= minDistance) {
      kept.push(points[i])
    }
  }
  kept.push(points[points.length - 1])
  return kept
}

function projectAll(points: LatLon[]): XY[] {
  const refLat = points[0].lat
  return points.map((p) => project(p, refLat))
}

/**
 * Ramer–Douglas–Peucker: keeps every point that deviates more than
 * `tolerance` metres from the simplified line. Iterative to avoid blowing the
 * stack on long tracks.
 */
export function douglasPeucker<T extends LatLon>(
  points: T[],
  tolerance: number,
): T[] {
  if (points.length < 3 || tolerance <= 0) return [...points]
  const xy = projectAll(points)
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1
  const tolSq = tolerance * tolerance
  const stack: Array<[number, number]> = [[0, points.length - 1]]

  while (stack.length > 0) {
    const [first, last] = stack.pop() as [number, number]
    let maxDistSq = 0
    let index = first
    for (let i = first + 1; i < last; i++) {
      const { distSq } = projectOnSegment(xy[i], xy[first], xy[last])
      if (distSq > maxDistSq) {
        maxDistSq = distSq
        index = i
      }
    }
    if (maxDistSq > tolSq) {
      keep[index] = 1
      stack.push([first, index], [index, last])
    }
  }

  return points.filter((_, i) => keep[i] === 1)
}

class MinHeap {
  private items: Array<{ index: number; area: number }> = []

  get size() {
    return this.items.length
  }

  push(item: { index: number; area: number }) {
    const items = this.items
    items.push(item)
    let i = items.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (items[parent].area <= items[i].area) break
      ;[items[parent], items[i]] = [items[i], items[parent]]
      i = parent
    }
  }

  pop(): { index: number; area: number } {
    const items = this.items
    const top = items[0]
    const last = items.pop() as { index: number; area: number }
    if (items.length > 0) {
      items[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let smallest = i
        if (l < items.length && items[l].area < items[smallest].area)
          smallest = l
        if (r < items.length && items[r].area < items[smallest].area)
          smallest = r
        if (smallest === i) break
        ;[items[smallest], items[i]] = [items[i], items[smallest]]
        i = smallest
      }
    }
    return top
  }
}

/**
 * Visvalingam–Whyatt: repeatedly removes the point forming the smallest
 * triangle with its neighbours until every remaining triangle is at least
 * `minArea` m². Tends to keep the natural shape of winding paths better than
 * Douglas–Peucker.
 */
export function visvalingam<T extends LatLon>(
  points: T[],
  minArea: number,
): T[] {
  const n = points.length
  if (n < 3 || minArea <= 0) return [...points]
  const xy = projectAll(points)
  const prev = Array.from({ length: n }, (_, i) => i - 1)
  const next = Array.from({ length: n }, (_, i) => i + 1)
  const area = new Float64Array(n)
  const removed = new Uint8Array(n)
  const heap = new MinHeap()

  for (let i = 1; i < n - 1; i++) {
    area[i] = triangleArea(xy[i - 1], xy[i], xy[i + 1])
    heap.push({ index: i, area: area[i] })
  }

  while (heap.size > 0) {
    const { index, area: popped } = heap.pop()
    // Skip entries made stale by a neighbour's removal.
    if (removed[index] || popped !== area[index]) continue
    if (popped >= minArea) break
    removed[index] = 1
    const p = prev[index]
    const nx = next[index]
    next[p] = nx
    prev[nx] = p
    for (const j of [p, nx]) {
      if (j <= 0 || j >= n - 1) continue
      // Never let a neighbour's area drop below the one just removed, so the
      // elimination order stays monotonic.
      area[j] = Math.max(popped, triangleArea(xy[prev[j]], xy[j], xy[next[j]]))
      heap.push({ index: j, area: area[j] })
    }
  }

  return points.filter((_, i) => !removed[i])
}

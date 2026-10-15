import { haversine } from '@sdlgr/gpx-tools'

import type { RouteLandmark } from './types'

/** Main Overpass server, then a mirror: the main one is often busy. */
export const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

/** How far from a summit or col an OpenStreetMap feature may be. */
const OSM_RADIUS = 150

interface OsmNode {
  lat: number
  lon: number
  tags?: Record<string, string>
}

function osmKind(tags: Record<string, string>): RouteLandmark['kind'] | null {
  if (tags.natural === 'peak' || tags.natural === 'volcano') return 'peak'
  if (tags.natural === 'saddle' || tags.mountain_pass === 'yes') return 'col'
  return null
}

/**
 * Names the unnamed summits and cols after the closest OpenStreetMap peak or
 * saddle/pass of the same kind, through one Overpass query. Any failure leaves
 * them as they were: names are a nicety, never a reason to fail a parse.
 */
export async function nameLandmarksFromOsm(
  landmarks: RouteLandmark[],
  fetchImpl: typeof fetch = fetch,
): Promise<RouteLandmark[]> {
  const missing = landmarks.filter((l) => !l.name)
  if (missing.length === 0) return landmarks

  const clauses = missing
    .map(
      ({ lat, lon }) =>
        `node(around:${OSM_RADIUS},${lat},${lon})["natural"~"^(peak|volcano|saddle)$"]["name"];` +
        `node(around:${OSM_RADIUS},${lat},${lon})["mountain_pass"="yes"]["name"];`,
    )
    .join('')
  const query = `[out:json][timeout:10];(${clauses});out body;`

  let nodes: OsmNode[] | null = null
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'sawl.dev blog card generator',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) continue
      nodes = ((await res.json()) as { elements?: OsmNode[] }).elements ?? []
      break
    } catch {
      // Busy, down or not JSON: try the next server.
    }
  }
  if (!nodes) return landmarks

  return landmarks.map((landmark) => {
    if (landmark.name) return landmark
    const match = (nodes as OsmNode[])
      .filter((n) => n.tags && osmKind(n.tags) === landmark.kind)
      .map((n) => ({ name: n.tags?.name, d: haversine(n, landmark) }))
      .filter((n) => n.d <= OSM_RADIUS)
      .sort((a, b) => a.d - b.d)[0]
    return match ? { ...landmark, name: match.name } : landmark
  })
}

import { haversine } from '@sdlgr/gpx-tools'

import type { RouteLandmark } from './types'

/** Overpass servers, asked at once: any of them is often busy or down. */
export const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

export interface OsmNaming {
  landmarks: RouteLandmark[]
  /** No Overpass server answered, so unnamed landmarks stayed unnamed. */
  unavailable: boolean
}

/** How far from a summit or col an OpenStreetMap feature may be. */
const OSM_RADIUS = 150

/** Names are a nicety: give up soon rather than keep the form waiting. */
const OVERPASS_TIMEOUT_S = 4

interface OsmNode {
  lat: number
  lon: number
  tags?: Record<string, string>
}

/** The first promise to resolve; rejects only once all of them have. */
function firstSuccess<T>(tasks: Array<Promise<T>>): Promise<T> {
  return new Promise((resolve, reject) => {
    let failed = 0
    for (const task of tasks) {
      task.then(resolve, () => {
        failed += 1
        if (failed === tasks.length) reject(new Error('No server answered'))
      })
    }
  })
}

function osmKind(tags: Record<string, string>): RouteLandmark['kind'] | null {
  if (tags.natural === 'peak' || tags.natural === 'volcano') return 'peak'
  if (tags.natural === 'saddle' || tags.mountain_pass === 'yes') return 'col'
  return null
}

/**
 * Names the unnamed summits and cols after the closest OpenStreetMap peak or
 * saddle/pass of the same kind, through one Overpass query sent to every
 * server at once (the first answer wins). If none answers they stay as they
 * were: names are a nicety, never a reason to fail a parse.
 */
export async function nameLandmarksFromOsm(
  landmarks: RouteLandmark[],
  fetchImpl: typeof fetch = fetch,
): Promise<OsmNaming> {
  const missing = landmarks.filter((l) => !l.name)
  if (missing.length === 0) return { landmarks, unavailable: false }

  const clauses = missing
    .map(
      ({ lat, lon }) =>
        `node(around:${OSM_RADIUS},${lat},${lon})["natural"~"^(peak|volcano|saddle)$"]["name"];` +
        `node(around:${OSM_RADIUS},${lat},${lon})["mountain_pass"="yes"]["name"];`,
    )
    .join('')
  const query = `[out:json][timeout:${OVERPASS_TIMEOUT_S}];(${clauses});out body;`

  const ask = async (url: string): Promise<OsmNode[]> => {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'sawl.dev blog card generator',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(OVERPASS_TIMEOUT_S * 1000),
    })
    if (!res.ok) throw new Error(`Overpass ${res.status}`)
    return ((await res.json()) as { elements?: OsmNode[] }).elements ?? []
  }

  let nodes: OsmNode[]
  try {
    nodes = await firstSuccess(OVERPASS_URLS.map(ask))
  } catch {
    return { landmarks, unavailable: true }
  }

  const named = landmarks.map((landmark) => {
    if (landmark.name) return landmark
    const match = nodes
      .filter((n) => n.tags && osmKind(n.tags) === landmark.kind)
      .map((n) => ({ name: n.tags?.name, d: haversine(n, landmark) }))
      .filter((n) => n.d <= OSM_RADIUS)
      .sort((a, b) => a.d - b.d)[0]
    return match ? { ...landmark, name: match.name } : landmark
  })
  return { landmarks: named, unavailable: false }
}

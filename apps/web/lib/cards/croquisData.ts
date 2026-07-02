import {
  detectSeverity,
  extractMeters,
  extractSide,
} from './canyonWaypointCard'
import type {
  CanyonSeverity,
  CanyonSide,
  CanyonWaypoint,
  CanyonWaypointNote,
} from './canyonWaypoints'

/** Obstacle gestures the croquis can draw. A rappel + jump combines to a split. */
export type CroquisType = 'rapel' | 'tobogan' | 'salto' | 'salto-rapel'

/** A canyon waypoint reduced to what the croquis needs to draw and annotate. */
export interface CroquisObstacle {
  type: CroquisType
  title: string
  /** Drop height in metres (drives the glyph size), or null when unknown. */
  meters: number | null
  side: CanyonSide | null
  severity: CanyonSeverity
  notes: CanyonWaypointNote[]
  lat?: number
  lon?: number
  /** Illustrative photos shown on hover; falls back to a drawn scene when empty. */
  photos?: string[]
}

/** Resolve the glyph type from a waypoint's category keys (null → not drawn). */
function resolveType(categories: string[]): CroquisType | null {
  const hasR = categories.includes('rappel')
  const hasT = categories.includes('tobogan')
  const hasS = categories.includes('salto')
  if (hasR && hasS) return 'salto-rapel'
  if (hasR) return 'rapel'
  if (hasT) return 'tobogan'
  if (hasS) return 'salto'
  return null
}

/** Whether a waypoint (by its categories) is drawn in the croquis. */
export function isDrawableWaypoint(categories: string[]): boolean {
  return resolveType(categories) !== null
}

/** Resolve a numeric drop height from an explicit override or the title text. */
function resolveMeters(wp: CanyonWaypoint): number | null {
  const raw = wp.meters ?? extractMeters(wp.title) ?? ''
  const n = parseFloat(raw.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * Reduce parsed canyon waypoints to the ordered obstacle list the croquis
 * draws. Waypoints whose categories are none of rappel / slide / jump are
 * dropped (info points, junctions, pools on their own, …).
 */
export function toCroquisObstacles(
  waypoints: CanyonWaypoint[],
): CroquisObstacle[] {
  const out: CroquisObstacle[] = []
  for (const wp of waypoints) {
    const type = resolveType(wp.categories)
    if (!type) continue
    out.push({
      type,
      title: wp.title,
      meters: resolveMeters(wp),
      side: wp.side ?? extractSide(wp.title),
      severity: wp.severity ?? detectSeverity(wp.title, wp.notes),
      notes: wp.notes,
      lat: wp.lat,
      lon: wp.lon,
      ...(wp.photos?.length ? { photos: wp.photos } : {}),
    })
  }
  return out
}

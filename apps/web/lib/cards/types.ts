import type { Lang } from './theme'

export type { Lang }

/**
 * An interactive hit-zone on a summary card. Coordinates are in the card's
 * 1600×900 SVG user-space, so overlay rects placed at these boxes stay aligned
 * with the drawn content under any CSS scaling.
 */
export interface CardZone {
  /** Stable identifier, unique within a card (e.g. `grade-vert`, `flow`). */
  id: string
  /** What kind of section the zone explains. */
  kind: 'grade' | 'flow' | 'phenomenon' | 'ferrata-grade'
  /** The scale/axis or catalogue key (`vert`/`aqua`/`commit`, flow level, or phenomenon key). */
  key: string
  /** The concrete token shown in the card (e.g. `v4`), when relevant. */
  value?: string
  x: number
  y: number
  w: number
  h: number
}

/**
 * Where the elevation profile is drawn, in the card's 1600×900 user-space, so
 * an overlay can point at any sample of it.
 */
export interface CardProfile {
  elevation: number[]
  /** Named summits and cols; without them the highest summits are marked. */
  landmarks?: RouteLandmark[]
  x0: number
  x1: number
  top: number
  bottom: number
}

/** A summary card SVG plus the interactive zones laid over it. */
export interface CardResult {
  svg: string
  width: number
  height: number
  zones: CardZone[]
  /** The drawn elevation profile, when the card has one. */
  profile?: CardProfile
}

export interface CanyoningCardData {
  kind: 'canyoning-data'
  lang: Lang
  title?: string
  date?: string
  grade?: string
  desnivel?: string
  maxRappel?: string
  rappels?: string
  approach?: string
  inCanyon?: string
  returnTime?: string
  total?: string
  rope?: string
  flowLevel?: string
  flowRappels?: string
  phenomena?: string[]
  season?: string
  cars?: string
  /** GPX source url (optional). When it yields elevation, the profile shows. */
  gpxUrl?: string
  /** Downsampled elevation series; drives the elevation profile when present. */
  elevation?: number[]
}

/**
 * A spot along a route, placed on its stored elevation profile: a summit, a
 * col, or any other GPX waypoint (hut, spring, warning…).
 */
export interface RouteLandmark {
  kind: 'peak' | 'col' | 'point'
  /** Waypoint category (refugio, fuente…) that picks a point's icon. */
  category?: string
  /** Sample of `elevation` it sits on. */
  index: number
  /** Real altitude at the spot, in metres. */
  ele: number
  lat: number
  lon: number
  /** From a GPX waypoint or OpenStreetMap; editable in the form. */
  name?: string
  /** Kept in the data but left off the card. */
  hidden?: boolean
  /** Leave the altitude out of its label on the card. */
  hideAltitude?: boolean
}

export interface SummaryRouteData {
  kind: 'summary-route'
  lang: Lang
  title?: string
  date?: string
  /** Loop (ends where it starts) or one way (start and end differ). */
  shape?: 'loop' | 'linear'
  dist?: string
  dplus?: string
  dminus?: string
  mov?: string
  det?: string
  tot?: string
  ini?: string
  fin?: string
  ret?: string
  gpxUrl?: string
  elevation?: number[]
  /** Summits and cols to point out on the profile. */
  landmarks?: RouteLandmark[]
  /** Note under the profile that GPS altitudes may be off (default: shown). */
  altitudeNote?: boolean
  /** How they are labelled on the card (default: names); a legend goes
   * under the profile and makes the card taller. */
  landmarkLabels?: 'auto' | 'names' | 'legend' | 'markers'
}

export interface SummaryFerrataData {
  kind: 'summary-ferrata'
  lang: Lang
  title?: string
  date?: string
  grade?: string
  cable?: string
  vertical?: string
  mov?: string
  det?: string
  tot?: string
  ini?: string
  fin?: string
  ret?: string
  gpxUrl?: string
  elevation?: number[]
}

export type CardSpec = CanyoningCardData | SummaryRouteData | SummaryFerrataData

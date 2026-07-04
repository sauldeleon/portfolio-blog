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

/** A summary card SVG plus the interactive zones laid over it. */
export interface CardResult {
  svg: string
  width: number
  height: number
  zones: CardZone[]
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

export interface SummaryRouteData {
  kind: 'summary-route'
  lang: Lang
  title?: string
  date?: string
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

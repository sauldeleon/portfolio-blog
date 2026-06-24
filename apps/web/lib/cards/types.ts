import type { Lang } from './theme'

export type { Lang }

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

export interface SummaryCanyoningData {
  kind: 'summary-canyoning'
  lang: Lang
  title?: string
  date?: string
  grade?: string
  desnivel?: string
  maxRappel?: string
  rappels?: string
  mov?: string
  det?: string
  tot?: string
  ini?: string
  fin?: string
  ret?: string
  rope?: string
  flowLevel?: string
  flowRappels?: string
  phenomena?: string[]
  cars?: string
  season?: string
  gpxUrl?: string
  elevation?: number[]
}

export type CardSpec =
  | CanyoningCardData
  | SummaryRouteData
  | SummaryFerrataData
  | SummaryCanyoningData

import {
  LEGEND_ROW_HEIGHT,
  type LandmarkLabels,
  formatMetres,
  landmarkSpace,
  landmarksSvg,
  legendRows,
} from './landmarksSvg'
import { elevationProfile, esc, eyebrow, hRule } from './primitives'
import { COLD, STRINGS } from './theme'
import type { CardProfile, Lang, RouteLandmark } from './types'

export interface ProfileSectionInput {
  lang: Lang
  /** Downsampled elevation series; under two samples draws nothing. */
  elevation?: number[]
  landmarks?: RouteLandmark[]
  labels?: LandmarkLabels
  /** Note under the profile that GPS altitudes may be off. */
  altitudeNote?: boolean
  /** Baseline of the section's eyebrow. */
  y: number
  x0: number
  x1: number
  /** The card's base height; a legend grows the card below it. */
  height: number
}

export interface ProfileSection {
  svg: string
  /** Extra height the legend adds under the card's base height. */
  extraHeight: number
  profile?: CardProfile
}

/**
 * The elevation profile block shared by the route and canyon cards: eyebrow,
 * profile, its landmarks (labelled on the profile or in a legend that grows
 * the card) and the GPS altitude note.
 */
export function profileSection(input: ProfileSectionInput): ProfileSection {
  const elevation = input.elevation ?? []
  if (elevation.length < 2) return { svg: '', extraHeight: 0 }
  const { x0, x1, y, height, lang } = input
  const landmarks = (input.landmarks ?? []).filter(
    (l) => !l.hidden && l.index < elevation.length,
  )
  const altitudeNote = input.altitudeNote ?? false
  const opts = {
    labels: input.labels ?? 'names',
    formatAltitude: (m: number) => formatMetres(m, lang),
    // Labels under the profile stop short of the note.
    floor: altitudeNote ? height - 52 : undefined,
  }
  const top = y + 32 + landmarkSpace(landmarks, opts.labels)
  const bottom = altitudeNote ? height - 62 : height - 40
  const area = { elevation, x0, x1, top, bottom }
  const legendBelow = opts.labels === 'legend' && landmarks.length > 0
  const extraHeight = legendBelow
    ? legendRows(landmarks, opts, x0, x1) * LEGEND_ROW_HEIGHT + 30
    : 0

  const svg =
    eyebrow(x0, y, STRINGS[lang].profile) +
    elevationProfile(elevation, x0, x1, top, bottom) +
    landmarksSvg(area, landmarks, opts, { x0, x1, y: height + 30 }) +
    (altitudeNote
      ? `<text x="${x1}" y="${height - 34}" text-anchor="end" font-family="Poppins" font-style="italic" font-size="15" fill="${COLD}" opacity="0.8" data-altitude-note="">${esc(STRINGS[lang].altitude_note)}</text>`
      : '') +
    (legendBelow ? hRule(x0, x1, height - 10) : '')

  return {
    svg,
    extraHeight,
    profile: {
      ...area,
      landmarks: landmarks.length > 0 ? landmarks : undefined,
    },
  }
}

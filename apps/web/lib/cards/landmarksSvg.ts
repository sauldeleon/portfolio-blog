import { iconPath } from './icons'
import { esc, profilePoint, tw } from './primitives'
import { AMBER, BG_BOT, BONE, COLD } from './theme'
import type { CardProfile, RouteLandmark } from './types'
import { categoryIcon } from './waypoints'

/** `2.417 m` / `2,417 m`: altitudes grouped the way each language does. */
export function formatMetres(metres: number, lang: 'es' | 'en'): string {
  const digits = String(Math.round(metres))
  const grouped = digits.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    lang === 'es' ? '.' : ',',
  )
  return `${grouped} m`
}

/** How the summits and cols of a route card are labelled. */
export type LandmarkLabels = 'auto' | 'names' | 'legend' | 'markers'

export interface LandmarkOptions {
  labels: LandmarkLabels
  /** Formats an altitude for the card language, e.g. `2.417 m`. */
  formatAltitude: (metres: number) => string
  /** Lowest baseline a label may take (e.g. above a note under the profile). */
  floor?: number
}

const NAME_SIZE = 18
const ALT_SIZE = 16
const LINE = 26
/** Lines of names that fit over the profile. */
const ROOM_LINES = 3
const LEGEND_ROW = 32
const LEGEND_GAP = 36

/**
 * A landmark's marker as drawn on the card (▲ summit, ▼ col, or the
 * category icon in a round badge), centred on (x, y).
 */
export function landmarkMarkerSvg(
  lm: Pick<RouteLandmark, 'kind' | 'category'>,
  x: number,
  y: number,
): string {
  const { kind } = lm
  if (kind === 'point') {
    // Other waypoints: their category icon in a small round badge.
    const size = 15
    return (
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="${BG_BOT}" stroke="${AMBER}" stroke-width="2"/>` +
      `<g transform="translate(${(x - size / 2).toFixed(1)},${(y - size / 2).toFixed(1)}) scale(${(size / 100).toFixed(3)})">${iconPath(categoryIcon(lm.category ?? 'info'))}</g>`
    )
  }
  // Centred on their box, not on their tip, so they sit level with text.
  const r = 9
  const h = r * 0.85
  const d =
    kind === 'peak'
      ? `M${x},${y - h} L${x + r},${y + h} L${x - r},${y + h} Z`
      : `M${x},${y + h} L${x + r},${y - h} L${x - r},${y - h} Z`
  const fill = kind === 'peak' ? AMBER : BG_BOT
  return `<path d="${d}" fill="${fill}" stroke="${AMBER}" stroke-width="3" stroke-linejoin="round"/>`
}

function numberSvg(n: number, x: number, y: number): string {
  return (
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13" fill="${BG_BOT}" stroke="${AMBER}" stroke-width="2.5"/>` +
    `<text x="${x.toFixed(1)}" y="${(y + 5.5).toFixed(1)}" text-anchor="middle" font-family="Roboto Mono" font-weight="bold" font-size="15" fill="${BONE}">${n}</text>`
  )
}

function labelParts(lm: RouteLandmark, opts: LandmarkOptions) {
  const name = lm.name?.trim() ?? ''
  // A spot without a name always shows its altitude, or it would say nothing.
  const alt = !lm.hideAltitude || !name ? opts.formatAltitude(lm.ele) : ''
  return { name, alt }
}

/** Approximate width of a name plus altitude label. */
function labelWidth(name: string, alt: string): number {
  const gap = name && alt ? 10 : 0
  return tw(name, 'bold', NAME_SIZE) * 1.04 + gap + tw(alt, 'mono', ALT_SIZE)
}

function labelText(
  name: string,
  alt: string,
  x: number,
  y: number,
  anchor: 'middle' | 'start' = 'middle',
): string {
  const nameSpan = name
    ? `<tspan font-family="Poppins" font-weight="600" font-size="${NAME_SIZE}" fill="${BONE}">${esc(name)}</tspan>`
    : ''
  const altSpan = alt
    ? `<tspan font-family="Roboto Mono" font-size="${ALT_SIZE}" fill="${COLD}"${name ? ' dx="10"' : ''}>${esc(alt)}</tspan>`
    : ''
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}">${nameSpan}${altSpan}</text>`
}

/** Room the labels need above the profile, so the card pushes it down. */
export function landmarkSpace(
  landmarks: RouteLandmark[],
  labels: LandmarkLabels,
): number {
  if (landmarks.length === 0) return 0
  if (labels === 'markers') return 14
  // Legend: the numbers over the markers need room above the highest one.
  if (labels === 'legend') return 40
  return ROOM_LINES * LINE
}

/** Rows a legend wraps into between `start` and `end`. */
export function legendRows(
  landmarks: RouteLandmark[],
  opts: LandmarkOptions,
  start: number,
  end: number,
): number {
  return landmarks.length === 0
    ? 0
    : legendLayout(landmarks, opts, start, end).rows
}

export const LEGEND_ROW_HEIGHT = LEGEND_ROW

/**
 * The legend as a grid: every column as wide as the widest entry, so the
 * numbers, icons and names line up from row to row.
 */
function legendLayout(
  landmarks: RouteLandmark[],
  opts: LandmarkOptions,
  start: number,
  end: number,
) {
  const entries = landmarks.map((lm, i) => {
    const { name, alt } = labelParts(lm, opts)
    return { lm, n: i + 1, name, alt, w: 64 + labelWidth(name, alt) }
  })
  const column = Math.max(...entries.map((e) => e.w)) + LEGEND_GAP
  const columns = Math.max(1, Math.floor((end - start + LEGEND_GAP) / column))
  const items = entries.map((entry, i) => ({
    ...entry,
    x: start + (i % columns) * column,
    row: Math.floor(i / columns),
  }))
  return { items, rows: Math.ceil(entries.length / columns) }
}

/**
 * The summits and cols drawn on the static card: markers on the profile and,
 * depending on `labels`, names next to them or a numbered legend above it.
 */
export function landmarksSvg(
  profile: CardProfile,
  landmarks: RouteLandmark[],
  opts: LandmarkOptions,
  legend: { x0: number; x1: number; y: number },
): string {
  const points = landmarks.map((lm) => ({
    lm,
    ...profilePoint(profile, lm.index),
  }))

  if (opts.labels === 'legend') {
    const { items } = legendLayout(landmarks, opts, legend.x0, legend.x1)
    const legendSvg = items
      .map(({ lm, n, name, alt, x, row }) => {
        const y = legend.y + row * LEGEND_ROW
        return (
          numberSvg(n, x + 13, y - 6) +
          landmarkMarkerSvg(lm, x + 46, y - 6) +
          labelText(name, alt, x + 64, y, 'start')
        )
      })
      .join('')
    const numbers = points
      .map(({ x, y }, i) => numberSvg(i + 1, x, y - 22))
      .join('')
    const markers = points.map(({ lm, x, y }) => landmarkMarkerSvg(lm, x, y))
    return legendSvg + markers.join('') + numbers
  }

  const markers = points.map(({ lm, x, y }) => landmarkMarkerSvg(lm, x, y))
  if (opts.labels === 'markers') return markers.join('')

  // Names: summits above their marker, cols below; a label that would cover
  // another one moves a line further out, with a leader back to its marker.
  // Markers count as taken spots, so Auto never writes over one.
  type Box = { left: number; right: number; top: number; bottom: number }
  const placed: Box[] = points.map(({ x, y }) => ({
    left: x - 10,
    right: x + 10,
    top: y - 10,
    bottom: y + 10,
  }))
  // Labels stay in the room reserved above the profile (never over its
  // heading) and inside the card below it.
  const highest = profile.top - ROOM_LINES * LINE + 17
  const lowest = Math.min(profile.bottom + 18, opts.floor ?? Infinity)
  const overlaps = (a: Box, b: Box) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

  // Height of the profile line at x, between samples.
  const n = profile.elevation.length
  const curveY = (x: number) => {
    const t = ((x - profile.x0) / (profile.x1 - profile.x0)) * (n - 1)
    const i = Math.max(0, Math.min(n - 2, Math.floor(t)))
    const a = profilePoint(profile, i)
    const b = profilePoint(profile, i + 1)
    return a.y + (b.y - a.y) * Math.min(1, Math.max(0, t - i))
  }
  // Highest and lowest point of the line under a span of the card.
  const curveSpan = (left: number, right: number) => {
    let top = Infinity
    let bottom = -Infinity
    for (let x = left; x < right + 4; x += 4) {
      const cy = curveY(Math.min(x, right))
      top = Math.min(top, cy)
      bottom = Math.max(bottom, cy)
    }
    return { top, bottom }
  }

  type Point = { x: number; y: number }
  type Segment = { from: Point; to: Point }
  type Spot = {
    cx: number
    ly: number
    box: Box
    leader: Segment | null
    clearsLine: boolean
    cost: number
  }
  // Whether a leader really runs through a box (checked along its length,
  // so a slanted one passing by a label's corner does not count).
  const crosses = ({ from, to }: Segment, b: Box) => {
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / 3),
    )
    for (let i = 0; i <= steps; i++) {
      const px = from.x + ((to.x - from.x) * i) / steps
      const py = from.y + ((to.y - from.y) * i) / steps
      if (px > b.left && px < b.right && py > b.top && py < b.bottom)
        return true
    }
    return false
  }
  const leaders: Segment[] = []
  const RANK: Record<RouteLandmark['kind'], number> = {
    peak: 0,
    col: 1,
    point: 2,
  }
  // The most telling spots choose first: summits (highest first), then cols,
  // then the rest.
  const order = [...points].sort(
    (a, b) => RANK[a.lm.kind] - RANK[b.lm.kind] || a.y - b.y,
  )
  const labels = order.map(({ lm, x, y }) => {
    const { name, alt } = labelParts(lm, opts)
    const w = labelWidth(name, alt)
    const preferBelow = lm.kind === 'col'
    const spots: Spot[] = []
    // Candidates: a few lines above and below the marker, each centred on it
    // or slid sideways.
    for (const above of [true, false]) {
      for (let k = 0; k < 6; k++) {
        const ly = above ? y - 18 - k * LINE : y + 34 + k * LINE
        if (ly < highest || ly > lowest) continue
        // Slid sideways, up to wholly beside the marker so a slanted leader
        // can go round other labels.
        const beside = 0.5 + 24 / w
        for (const shift of [0, -0.35, 0.35, -0.7, 0.7, -beside, beside]) {
          const cx = Math.min(
            profile.x1 - w / 2,
            Math.max(profile.x0 + w / 2, x + shift * w),
          )
          // The text box around a baseline: cap height above, descenders below.
          const box = {
            left: cx - w / 2 - 6,
            right: cx + w / 2 + 6,
            top: ly - 17,
            bottom: ly + 5,
          }
          const line = curveSpan(box.left, box.right)
          // Wholly above the line, or wholly under it inside the profile.
          const clearsLine = above
            ? box.bottom <= line.top - 3
            : box.top >= line.bottom + 3
          // A leader joins the marker to the nearest point of the label's
          // edge when they are apart: straight down or up, or slanted.
          const from = { x, y: above ? y - 12 : y + 12 }
          const to = {
            x: Math.min(box.right - 8, Math.max(box.left + 8, x)),
            y: above ? box.bottom : box.top,
          }
          const apart =
            Math.abs(to.y - from.y) > 10 || Math.abs(to.x - from.x) > 10
          const leader = apart ? { from, to } : null
          const cost =
            k * LINE +
            Math.abs(cx - x) * 0.5 +
            (above === !preferBelow ? 0 : 20)
          spots.push({ cx, ly, box, leader, clearsLine, cost })
        }
      }
    }
    const boxFree = (spot: Spot) =>
      !placed.some((b) => overlaps(spot.box, b)) &&
      !leaders.some((l) => crosses(l, spot.box))
    const leaderFree = (spot: Spot) =>
      !(spot.leader && placed.some((b) => crosses(spot.leader as Segment, b)))
    // How much a spot covers what is already placed, for the last resort.
    const covered = (spot: Spot) =>
      placed.reduce((sum, b) => {
        const w =
          Math.min(spot.box.right, b.right) - Math.max(spot.box.left, b.left)
        const h =
          Math.min(spot.box.bottom, b.bottom) - Math.max(spot.box.top, b.top)
        return sum + (w > 0 && h > 0 ? w * h : 0)
      }, 0)
    const cheapest = (list: Spot[], cost = (spot: Spot) => spot.cost) =>
      list.reduce<Spot | undefined>(
        (best, spot) => (best && cost(best) <= cost(spot) ? best : spot),
        undefined,
      )
    // Rules relax one at a time: a clean spot; then one over the line; then
    // one whose leader crosses another label. Auto stops there (the marker
    // stays without a name); Names takes the spot that covers the least.
    const best =
      cheapest(
        spots.filter((s) => s.clearsLine && boxFree(s) && leaderFree(s)),
      ) ??
      cheapest(spots.filter((s) => boxFree(s) && leaderFree(s))) ??
      cheapest(spots.filter(boxFree)) ??
      (opts.labels === 'auto'
        ? undefined
        : cheapest(spots, (s) => covered(s) * 1000 + s.cost))
    if (!best) return ''
    placed.push(best.box)
    if (best.leader) leaders.push(best.leader)
    const leader = best.leader
      ? `<line x1="${best.leader.from.x.toFixed(1)}" y1="${best.leader.from.y.toFixed(1)}" x2="${best.leader.to.x.toFixed(1)}" y2="${best.leader.to.y.toFixed(1)}" stroke="${AMBER}" stroke-opacity="0.5" stroke-width="1.5"/>`
      : ''
    return leader + labelText(name, alt, best.cx, best.ly)
  })
  return markers.join('') + labels.join('')
}

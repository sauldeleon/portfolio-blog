import { type IconKind, iconPath } from './icons'
import {
  AMBER,
  BADGE_BG,
  BONE,
  COLD,
  CONTOUR,
  FLOW_COLORS,
  type LangStrings,
  PANEL_STK,
} from './theme'

/** Escape XML special characters for SVG text content. */
export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Approximate text width in SVG units.
 * Uses character-width ratios derived from actual font metrics.
 * - Roboto Mono: ~0.6 × size (monospace)
 * - Poppins Bold: ~0.55 × size (proportional average)
 */
export function tw(text: string, font: 'mono' | 'bold', size: number): number {
  const ratio = font === 'mono' ? 0.601 : 0.55
  return text.length * ratio * size
}

/** Badge: rounded rect + icon, centred within a square of side `s`. */
export function badge(x: number, y: number, s: number, kind: IconKind): string {
  const iconFrac = 0.62
  const isz = (s * iconFrac) / 100
  const off = (s * (1 - iconFrac)) / 2
  return (
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${Math.round(s * 0.2)}" fill="${BADGE_BG}" ` +
    `stroke="${AMBER}" stroke-width="1.5" stroke-opacity="0.5"/>` +
    `<g transform="translate(${(x + off).toFixed(1)},${(y + off).toFixed(1)}) scale(${isz.toFixed(4)})">${iconPath(kind)}</g>`
  )
}

/** Contour lines: sine-wave polylines for background texture. */
export function contours(
  rows: Array<[base: number, amp: number]>,
  x0: number,
  x1: number,
  n = 24,
): string {
  return rows
    .map(([base, amp]) => {
      const pts: string[] = []
      for (let i = 0; i <= n; i++) {
        const x = x0 + (i * (x1 - x0)) / n
        const y = base + amp * Math.sin(i * 0.7 + base * 0.05)
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
      }
      return `<polyline points="${pts.join(' ')}" fill="none" stroke="${CONTOUR}" stroke-width="1.6" stroke-opacity="0.5"/>`
    })
    .join('\n')
}

/** Small amber square + uppercase label (eyebrow). */
export function eyebrow(x: number, y: number, text: string): string {
  return (
    `<rect x="${x}" y="${y - 11}" width="11" height="11" rx="2" fill="${AMBER}"/>` +
    `<text x="${x + 22}" y="${y}" font-family="Poppins" font-weight="500" font-size="20" letter-spacing="3" fill="${AMBER}">${esc(text)}</text>`
  )
}

/** Vertical divider line between tile columns. */
export function columnDivider(x: number, y1: number, y2: number): string {
  return `<line x1="${x.toFixed(1)}" y1="${y1}" x2="${x.toFixed(1)}" y2="${y2}" stroke="${PANEL_STK}" stroke-width="1" stroke-opacity="0.5"/>`
}

/** Horizontal rule. */
export function hRule(x0: number, x1: number, y: number): string {
  return `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${PANEL_STK}" stroke-width="1.5"/>`
}

/** Phenomenon key → icon kind for the observed-flow event chips. */
const PHENOMENON_ICON: Record<string, IconKind> = {
  backwash: 'ph_backwash',
  current: 'ph_current',
  murky: 'ph_murky',
  siphon: 'ph_siphon',
  recent_rain: 'ph_rain',
  none: 'ph_none',
}

/**
 * Observed-flow row for the difficulty zone: a difficulty-coloured "level" pill
 * (droplet + level label), a set of phenomenon icon chips, and the
 * affects-rappels answer as compact text. `y` is the top of the row.
 */
export function flowRow(
  x: number,
  y: number,
  level: string,
  affects: string | undefined,
  phenomena: string[],
  S: LangStrings,
): string {
  const levels: Record<string, string> = S.flow_levels
  const rappels: Record<string, string> = S.flow_rappels
  const color = FLOW_COLORS[level] ?? COLD
  const levelLabel = levels[level] ?? level

  const h = 40
  const pad = 14
  const dropCx = x + pad + 7
  const dropCy = y + h / 2
  const drop =
    `M${dropCx} ${(dropCy - 13).toFixed(1)} ` +
    `C ${dropCx + 9} ${(dropCy - 2).toFixed(1)}, ${dropCx + 7} ${(dropCy + 9).toFixed(1)}, ${dropCx} ${(dropCy + 9).toFixed(1)} ` +
    `C ${dropCx - 7} ${(dropCy + 9).toFixed(1)}, ${dropCx - 9} ${(dropCy - 2).toFixed(1)}, ${dropCx} ${(dropCy - 13).toFixed(1)} Z`
  const labelX = x + pad + 22
  const pillW = pad + 22 + tw(levelLabel, 'bold', 22) + pad
  const pill =
    `<rect x="${x.toFixed(1)}" y="${y}" width="${pillW.toFixed(1)}" height="${h}" rx="10" fill="${BADGE_BG}" stroke="${color}" stroke-width="1.4"/>` +
    `<path d="${drop}" fill="${color}"/>` +
    `<text x="${labelX.toFixed(1)}" y="${(y + 27).toFixed(1)}" font-family="Poppins" font-weight="500" font-size="22" fill="${BONE}">${esc(levelLabel)}</text>`

  let cursor = x + pillW + 12
  const chipSize = 32
  const chipY = y + (h - chipSize) / 2
  const chips: string[] = []
  for (const p of phenomena) {
    const icon = PHENOMENON_ICON[p]
    if (!icon) continue
    chips.push(badge(cursor, chipY, chipSize, icon))
    cursor += chipSize + 8
  }

  let affectsSvg = ''
  if (affects) {
    const al = rappels[affects] ?? affects
    affectsSvg = `<text x="${(cursor + 4).toFixed(1)}" y="${(y + 27).toFixed(1)}" font-family="Poppins" font-size="16" fill="${COLD}">${esc(al)}</text>`
  }

  return pill + chips.join('') + affectsSvg
}

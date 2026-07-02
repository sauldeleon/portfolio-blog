import type { CanyonSide, CanyonWaypointNote } from './canyonWaypoints'
import { FONT_STYLE } from './fonts'
import { type IconKind, iconPath } from './icons'
import { badge, contours, esc, eyebrow, tw } from './primitives'
import {
  AMBER,
  BADGE_BG,
  BG_BOT,
  BG_TOP,
  BONE,
  COLD,
  type Lang,
  type LangStrings,
  PANEL_STK,
  SEV_COLORS,
  STRINGS,
} from './theme'
import { categoryIcon, norm } from './waypoints'

const W = 1080
const PAD = 48
const RIGHT = W - PAD
const CX = 196

const BADGE_X = 40
const BADGE_Y = 44
const BADGE_S = 120

const TITLE_SIZE = 42
const TITLE_LH = 52
const TITLE_Y0 = 150
const NOTE_SIZE = 24
const NOTE_LH = 34
const BULLET_W = 28
const SUB_INDENT = 32
const BOTTOM_PAD = 40
const MIN_BOTTOM = 190

// Meta pills (drop height / side) shown top-right.
const PILL_Y = 48
const PILL_H = 46
const PILL_PAD = 14
const PILL_ISZ = 26
const PILL_TEXT = 22
const PILL_GAP = 12

export interface CanyonWaypointCardData {
  lang: Lang
  /** One or two category keys (two → split badge, e.g. rappel + jump). */
  categories: string[]
  title: string
  lat?: number
  lon?: number
  notes: CanyonWaypointNote[]
  /** Manual overrides; each falls back to auto-detection from the text. */
  side?: CanyonSide
  severity?: Severity
  meters?: string
}

/** Category badge: a single icon, or two icons split down the middle. */
function categoryBadge(categories: string[]): string {
  if (categories.length < 2) {
    return badge(BADGE_X, BADGE_Y, BADGE_S, categoryIcon(categories[0]))
  }
  const isz = 44
  const off = isz / 2
  const cy = BADGE_Y + BADGE_S / 2
  const mid = BADGE_X + BADGE_S / 2
  const lx = BADGE_X + BADGE_S / 4
  const rx = BADGE_X + (BADGE_S * 3) / 4
  const icon = (cx: number, key: string) =>
    `<g transform="translate(${(cx - off).toFixed(1)},${(cy - off).toFixed(1)}) scale(${(isz / 100).toFixed(4)})">${iconPath(categoryIcon(key))}</g>`
  return (
    `<rect x="${BADGE_X}" y="${BADGE_Y}" width="${BADGE_S}" height="${BADGE_S}" rx="24" fill="${BADGE_BG}" stroke="${AMBER}" stroke-width="1.6" stroke-opacity="0.55"/>` +
    `<line x1="${mid}" y1="${BADGE_Y + 20}" x2="${mid}" y2="${BADGE_Y + BADGE_S - 20}" stroke="${PANEL_STK}" stroke-width="1.2" stroke-opacity="0.8"/>` +
    icon(lx, categories[0]) +
    icon(rx, categories[1])
  )
}

/** A single rendered note line (a note may wrap onto several). */
interface NoteLine {
  text: string
  sub: boolean
  bullet: boolean
}

/** Greedy word-wrap to `maxW`, always returning at least one line. */
function wrap(text: string, size: number, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word
    if (cur && tw(next, 'bold', size) > maxW) {
      lines.push(cur)
      cur = word
    } else {
      cur = next
    }
  }
  if (cur) lines.push(cur)
  return lines.length ? lines : ['']
}

/** Expand notes into wrapped display lines. */
function noteLines(notes: CanyonWaypointNote[]): NoteLine[] {
  const out: NoteLine[] = []
  for (const note of notes) {
    const indent = note.sub ? SUB_INDENT : 0
    const maxW = RIGHT - (CX + BULLET_W + indent)
    wrap(note.text, NOTE_SIZE, maxW).forEach((line, i) =>
      out.push({ text: line, sub: note.sub, bullet: i === 0 }),
    )
  }
  return out
}

/** Pull the first "<n> m" height mention from a title (e.g. "Rappel 10m"). */
function extractMeters(title: string): string | null {
  const m = /(\d+(?:[.,]\d+)?)\s*m\b/i.exec(title)
  return m ? `${m[1].replace(',', '.')} m` : null
}

/** Detect a left/right side mention (ES/EN) in a title. */
function extractSide(title: string): 'left' | 'right' | null {
  const n = norm(title)
  if (/\b(izquierda|izqda|izda|izq|left)\b/.test(n)) return 'left'
  if (/\b(derecha|dcha|dcho|right)\b/.test(n)) return 'right'
  return null
}

type Severity = 'easy' | 'caution' | 'danger'

/** Keywords (diacritics-stripped) that escalate a waypoint to red / amber. */
const DANGER_KEYS = [
  'peligro',
  'rebufo',
  'sifon',
  'recirculacion',
  'fuerte corriente',
  'no saltar',
  'piedra en recepcion',
  'piedras ocultas',
  'tronco',
  'feo',
  'crecida',
  'resbala',
  'cuidado',
  'delicado',
  'danger',
]
const CAUTION_KEYS = [
  'ojo',
  'cubre poco',
  'cubre muy poco',
  'mejor destrepar',
  'flexionar',
  'revisar',
  'comprobar',
  'atencion',
  'quitar el cabo',
]

/** Grade a waypoint's risk from its title + notes wording. Red beats amber. */
function severity(title: string, notes: CanyonWaypointNote[]): Severity {
  const hay = norm([title, ...notes.map((n) => n.text)].join(' \n '))
  if (DANGER_KEYS.some((k) => hay.includes(k))) return 'danger'
  if (CAUTION_KEYS.some((k) => hay.includes(k))) return 'caution'
  return 'easy'
}

/** A meta pill: a leading icon or a coloured dot, followed by a label. */
interface Chip {
  text: string
  icon?: IconKind
  dot?: string
  stroke?: string
}

/** Width of a meta pill for the given label. */
function pillWidth(text: string): number {
  return PILL_PAD + PILL_ISZ + 8 + tw(text, 'mono', PILL_TEXT) + PILL_PAD
}

/** Render one meta pill at `x`. */
function pillSvg(x: number, chip: Chip): string {
  const glyphX = x + PILL_PAD
  const textX = glyphX + PILL_ISZ + 8
  const glyph = chip.icon
    ? `<g transform="translate(${glyphX.toFixed(1)},${(PILL_Y + (PILL_H - PILL_ISZ) / 2).toFixed(1)}) scale(${(PILL_ISZ / 100).toFixed(4)})">${iconPath(chip.icon)}</g>`
    : `<circle cx="${(glyphX + PILL_ISZ / 2).toFixed(1)}" cy="${PILL_Y + PILL_H / 2}" r="8" fill="${chip.dot}"/>`
  return (
    `<rect x="${x.toFixed(1)}" y="${PILL_Y}" width="${pillWidth(chip.text).toFixed(1)}" height="${PILL_H}" rx="12" fill="${BADGE_BG}" stroke="${chip.stroke ?? AMBER}" stroke-width="1.4" stroke-opacity="0.5"/>` +
    glyph +
    `<text x="${textX.toFixed(1)}" y="${PILL_Y + 31}" font-family="Roboto Mono" font-weight="bold" font-size="${PILL_TEXT}" fill="${BONE}">${esc(chip.text)}</text>`
  )
}

/** Build the right-aligned meta pill row (drop height, side, severity). */
function metaChips(
  meters: string | null,
  side: CanyonSide | null,
  sev: Severity,
  S: LangStrings,
): string {
  const chips: Chip[] = []
  if (meters) chips.push({ icon: 'vertical', text: meters })
  if (side)
    chips.push({
      icon: side === 'left' ? 'arrow_left' : 'arrow_right',
      text: side === 'left' ? S.side_left : S.side_right,
    })
  const sevLabel =
    sev === 'danger'
      ? S.sev_danger
      : sev === 'caution'
        ? S.sev_caution
        : S.sev_easy
  chips.push({ dot: SEV_COLORS[sev], stroke: SEV_COLORS[sev], text: sevLabel })

  const widths = chips.map((c) => pillWidth(c.text))
  const total =
    widths.reduce((a, b) => a + b, 0) + PILL_GAP * (chips.length - 1)
  let x = RIGHT - total
  return chips
    .map((c, i) => {
      const svg = pillSvg(x, c)
      x += widths[i] + PILL_GAP
      return svg
    })
    .join('')
}

/**
 * Generate the SVG for a single canyon waypoint card: category icon, title,
 * coordinates and the obstacle notes. The card height grows with the notes, so
 * the width/height are returned for the caller to raster and frame correctly.
 */
export function canyonWaypointCard(data: CanyonWaypointCardData): {
  svg: string
  width: number
  height: number
} {
  const S = STRINGS[data.lang]
  const cats: Record<string, string> = S.categories
  const catLabel = data.categories.map((c) => cats[c] ?? cats.info).join(' / ')

  const sev: Severity = data.severity ?? severity(data.title, data.notes)
  const meters = data.meters ?? extractMeters(data.title)
  const side = data.side ?? extractSide(data.title)
  const sevColor = SEV_COLORS[sev]
  const chipsSvg = metaChips(meters, side, sev, S)
  const titleLines = wrap(data.title || '—', TITLE_SIZE, RIGHT - CX)
  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="${CX}" y="${TITLE_Y0 + i * TITLE_LH}" font-family="Poppins" font-weight="700" font-size="${TITLE_SIZE}" fill="${BONE}">${esc(line)}</text>`,
    )
    .join('')

  const afterTitleY = TITLE_Y0 + (titleLines.length - 1) * TITLE_LH

  // --- coordinates row (optional) ---
  let coordsSvg = ''
  let cursorY = afterTitleY + 24
  if (
    data.lat != null &&
    data.lon != null &&
    Number.isFinite(data.lat) &&
    Number.isFinite(data.lon)
  ) {
    const coords = `${data.lat.toFixed(6)}, ${data.lon.toFixed(6)}`
    const rowY = afterTitleY + 44
    const cy = rowY - 18
    coordsSvg =
      `<g transform="translate(${CX},${cy})" fill="none" stroke="${COLD}" stroke-width="2.4" stroke-linecap="round">` +
      `<circle cx="9" cy="9" r="8.5"/><path d="M9 -1 L9 3 M9 15 L9 19 M-1 9 L3 9 M15 9 L19 9"/>` +
      `<circle cx="9" cy="9" r="1.6" fill="${COLD}"/></g>` +
      `<text x="${CX + 30}" y="${rowY}" font-family="Roboto Mono" font-size="24" fill="${COLD}">${esc(coords)}</text>`
    cursorY = rowY + 20
  }

  // --- notes ---
  const lines = noteLines(data.notes)
  const notesTop = cursorY + 20
  const notesSvg = lines
    .map((line, i) => {
      const indent = line.sub ? SUB_INDENT : 0
      const bx = CX + indent
      const baseline = notesTop + i * NOTE_LH + NOTE_SIZE
      const mark = line.bullet
        ? line.sub
          ? `<rect x="${bx}" y="${(baseline - 12).toFixed(1)}" width="11" height="2.6" rx="1" fill="${COLD}"/>`
          : `<circle cx="${bx + 4}" cy="${(baseline - 8).toFixed(1)}" r="3.6" fill="${AMBER}"/>`
        : ''
      return (
        mark +
        `<text x="${bx + BULLET_W}" y="${baseline}" font-family="Poppins" font-size="${NOTE_SIZE}" fill="${line.sub ? COLD : BONE}">${esc(line.text)}</text>`
      )
    })
    .join('')

  const contentBottom = lines.length
    ? notesTop + lines.length * NOTE_LH
    : cursorY
  const H = Math.round(Math.max(MIN_BOTTOM, contentBottom) + BOTTOM_PAD)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
 ${FONT_STYLE}
 <linearGradient id="panel" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${BG_TOP}"/><stop offset="1" stop-color="${BG_BOT}"/></linearGradient>
 <clipPath id="pc"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="28"/></clipPath>
</defs>
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="28" fill="url(#panel)" stroke="${PANEL_STK}" stroke-width="1.6"/>
<g clip-path="url(#pc)">${contours(
    [
      [40, 22],
      [120, 30],
      [210, 26],
    ],
    8,
    W - 8,
    22,
  )}</g>
<rect x="8" y="80" width="6" height="80" rx="3" fill="${sevColor}"/>
${categoryBadge(data.categories)}
${eyebrow(CX, 96, catLabel)}
${chipsSvg}
${titleSvg}
${coordsSvg}
${notesSvg}
</svg>`

  return { svg, width: W, height: H }
}

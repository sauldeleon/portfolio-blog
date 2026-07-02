import { FONT_STYLE } from './fonts'
import {
  badge,
  columnDivider,
  contours,
  elevationProfile,
  esc,
  eyebrow,
  flowRow,
  gradeSubLabel,
  hRule,
  tw,
} from './primitives'
import {
  AMBER,
  BADGE_BG,
  BG_BOT,
  BG_TOP,
  BONE,
  COLD,
  PANEL_STK,
  STRINGS,
} from './theme'
import type { CanyoningCardData } from './types'

const W = 1600
const H = 900
const CX0 = 56
const CXR = W - 56
const CW = CXR - CX0

/** Format a time value to HH:MM h.
 *  Accepts "H:MM", total minutes as string, or passthrough. */
function fmtTime(s: string | undefined): string | null {
  if (!s) return null
  const str = String(s).trim()
  if (str.includes(':')) {
    const [h, m] = str.split(':')
    return `${String(parseInt(h, 10)).padStart(2, '0')}:${String(parseInt(m, 10)).padStart(2, '0')} h`
  }
  const n = parseInt(str, 10)
  if (!isNaN(n)) {
    return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')} h`
  }
  return str
}

/** Grade-pills hero: canyon badge + up to three grade tokens with sub-labels. */
function gradePillsHero(
  x: number,
  grade: string,
  gVert: string,
  gAqua: string,
  gCommit: string,
): string {
  const bs = 78
  const by = 188
  const ph = 58
  const pillY = by + (bs - ph) / 2
  const parts: string[] = [badge(x, by, bs, 'canyon')]
  let px = x + bs + 24
  const tokens = String(grade || '—')
    .split(' ')
    .slice(0, 3)
  for (const tok of tokens) {
    const pw = tw(tok, 'mono', 32) + 24
    const sl = gradeSubLabel(tok, gVert, gAqua, gCommit)
    parts.push(
      `<rect x="${px.toFixed(1)}" y="${pillY}" width="${pw.toFixed(1)}" height="${ph}" rx="12" fill="${BADGE_BG}" stroke="${AMBER}" stroke-width="1.4" stroke-opacity="0.5"/>`,
      `<text x="${(px + pw / 2).toFixed(1)}" y="${pillY + 42}" text-anchor="middle" font-family="Roboto Mono" font-weight="bold" font-size="32" fill="${BONE}">${esc(tok)}</text>`,
    )
    if (sl) {
      parts.push(
        `<text x="${(px + pw / 2).toFixed(1)}" y="${pillY + ph + 18}" text-anchor="middle" font-family="Poppins" font-weight="500" font-size="12" letter-spacing="1.5" fill="${AMBER}">${sl}</text>`,
      )
    }
    px += pw + 12
  }
  return parts.join('')
}

/** Standard metric hero (bs=78, by=188). */
function hero(
  x: number,
  kind: Parameters<typeof badge>[3],
  value: string,
  label: string,
  colW: number,
): string {
  const bs = 78
  const by = 188
  const vx = x + bs + 24
  const avail = colW - (bs + 24) - 18
  let vsz = 56
  while (tw(value, 'mono', vsz) > avail && vsz > 30) vsz -= 2
  return (
    badge(x, by, bs, kind) +
    `<text x="${vx}" y="${by + 46}" font-family="Roboto Mono" font-weight="bold" font-size="${vsz}" fill="${BONE}">${esc(value)}</text>` +
    `<text x="${vx}" y="${by + 80}" font-family="Poppins" font-weight="500" font-size="21" letter-spacing="2" fill="${AMBER}">${esc(label)}</text>`
  )
}

/** One time tile (icon + value + label, centred), by=396. */
function tile(
  cx: number,
  kind: Parameters<typeof badge>[3],
  value: string,
  label: string,
): string {
  const bs = 56
  const bx = cx - bs / 2
  const by = 396
  return (
    badge(bx, by, bs, kind) +
    `<text x="${cx.toFixed(1)}" y="${by + bs + 44}" text-anchor="middle" font-family="Roboto Mono" font-weight="bold" font-size="34" fill="${BONE}">${esc(value)}</text>` +
    `<text x="${cx.toFixed(1)}" y="${by + bs + 74}" text-anchor="middle" font-family="Poppins" font-weight="500" font-size="17" letter-spacing="1.5" fill="${COLD}">${esc(label)}</text>`
  )
}

/**
 * Generate the SVG for the canyon card (1600×900): grade + metrics, the
 * activity time breakdown, the tech sheet, the observed flow, and — when a GPX
 * yields an elevation series — the elevation profile (hidden otherwise).
 */
export function canyoningCard(data: CanyoningCardData): string {
  const S = STRINGS[data.lang]

  // --- header ---
  const title = data.title || S.default_title
  let tsz = 50
  while (tw(title, 'bold', tsz) > CW - 520 && tsz > 26) tsz -= 2
  const titleSvg = `<text x="172" y="126" font-family="Poppins" font-weight="700" font-size="${tsz}" fill="${BONE}">${esc(title)}</text>`

  let chip = ''
  if (data.date) {
    const cw = tw(data.date, 'mono', 22) + 30
    chip =
      `<rect x="${(CXR - cw).toFixed(0)}" y="54" width="${cw.toFixed(0)}" height="42" rx="12" fill="${BADGE_BG}" stroke="${PANEL_STK}" stroke-width="1"/>` +
      `<text x="${(CXR - 15).toFixed(0)}" y="82" text-anchor="end" font-family="Roboto Mono" font-size="23" fill="${BONE}">${esc(data.date)}</text>`
  }

  // --- heroes (4 columns): grade, descent, longest rappel, count ---
  const cw4 = CW / 4
  const heroSvg =
    gradePillsHero(
      CX0 + cw4 * 0,
      data.grade ?? '—',
      S.g_vert,
      S.g_aqua,
      S.g_commit,
    ) +
    hero(CX0 + cw4 * 1, 'descent', data.desnivel ?? '—', S.desnivel, cw4) +
    hero(CX0 + cw4 * 2, 'rappel', data.maxRappel ?? '—', S.max_rappel, cw4) +
    hero(CX0 + cw4 * 3, 'drops', data.rappels ?? '—', S.rappels, cw4)

  // --- observed flow row (difficulty zone, below the grade hero) ---
  const flowSvg = data.flowLevel
    ? flowRow(
        CX0,
        290,
        data.flowLevel,
        data.flowRappels,
        data.phenomena ?? [],
        S,
      )
    : ''

  // --- activity time tiles (4 columns) ---
  type TileEntry = [Parameters<typeof badge>[3], string, string]
  const tileData: TileEntry[] = [
    ['hiker', fmtTime(data.approach) ?? '—', S.approach],
    ['canyon', fmtTime(data.inCanyon) ?? '—', S.in_canyon],
    ['return', fmtTime(data.returnTime) ?? '—', S.return],
    ['clock', fmtTime(data.total) ?? '—', S.total],
  ]
  const ncol = tileData.length
  const centers = tileData.map((_, k) => CX0 + (CW / ncol) * (k + 0.5))
  const tilesSvg = tileData
    .map(([k, v, l], i) => tile(centers[i], k, v, l))
    .join('')
  const dividersSvg = Array.from({ length: ncol - 1 }, (_, k) =>
    columnDivider(CX0 + (CW / ncol) * (k + 1), 408, 518),
  ).join('')

  // --- tech strip ---
  const techItems: Array<[string, string]> = []
  if (data.rope) techItems.push([S.rope, data.rope])
  if (data.cars) techItems.push([S.cars, data.cars])
  if (data.season) techItems.push([S.season, data.season])

  let techSvg = ''
  if (techItems.length > 0) {
    const sep = `<tspan fill="${COLD}">     ·     </tspan>`
    const parts = techItems.map(
      ([lab, val]) =>
        `<tspan fill="${AMBER}" font-weight="500" letter-spacing="1">${esc(lab)} </tspan><tspan fill="${BONE}" font-family="Roboto Mono">${esc(String(val))}</tspan>`,
    )
    techSvg =
      eyebrow(CX0, 602, S.tech_header) +
      `<text x="${CX0}" y="644" font-family="Poppins" font-size="22">${parts.join(sep)}</text>`
  }

  // --- elevation profile (only when a GPX yielded a series) ---
  const elevation = data.elevation ?? []
  const profileY = techSvg ? 672 : 602
  const profileSvg =
    elevation.length >= 2
      ? eyebrow(CX0, profileY, S.profile) +
        elevationProfile(elevation, CX0, CXR, profileY + 32, 860)
      : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
 ${FONT_STYLE}
 <linearGradient id="panel" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${BG_TOP}"/><stop offset="1" stop-color="${BG_BOT}"/></linearGradient>
 <clipPath id="pc"><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="30"/></clipPath>
</defs>
<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="30" fill="url(#panel)" stroke="${PANEL_STK}" stroke-width="1.6"/>
<g clip-path="url(#pc)">${contours(
    [
      [70, 26],
      [300, 30],
      [560, 28],
      [800, 24],
    ],
    16,
    W - 16,
    24,
  )}</g>
<rect x="16" y="62" width="6" height="94" rx="3" fill="${AMBER}"/>
${badge(56, 46, 96, 'canyon')}
${eyebrow(172, 69, S.canyon_card)}
${titleSvg}
${chip}
${hRule(CX0, CXR, 336)}
${heroSvg}
${eyebrow(CX0, 383, S.times_header)}${dividersSvg}${tilesSvg}
${hRule(CX0, CXR, 562)}
${techSvg}
${flowSvg}
${profileSvg}
</svg>`
}

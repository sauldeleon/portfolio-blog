import { FONT_STYLE } from './fonts'
import {
  badge,
  columnDivider,
  contours,
  esc,
  eyebrow,
  flowRow,
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

/** Sub-label for a grade token (v4, a3, III…). */
function gradeSubLabel(
  tok: string,
  gVert: string,
  gAqua: string,
  gCommit: string,
): string {
  const c = tok[0]?.toLowerCase() ?? ''
  if (c === 'v' && /\d/.test(tok)) return gVert
  if (c === 'a' && /\d/.test(tok)) return gAqua
  if (/^[IVXLCDM]+$/.test(tok)) return gCommit
  return ''
}

/** Grade pills row (large, with sub-labels). */
function gradePills(
  grade: string,
  gVert: string,
  gAqua: string,
  gCommit: string,
  difficultyLabel: string,
): string {
  const gy = 206
  const ph = 74
  let px = CX0 + 2
  const parts: string[] = [eyebrow(CX0, 184, difficultyLabel)]
  const tokens = String(grade || '—')
    .split(' ')
    .slice(0, 3)
  for (const tok of tokens) {
    const pw = tw(tok, 'mono', 46) + 34
    const sl = gradeSubLabel(tok, gVert, gAqua, gCommit)
    parts.push(
      `<rect x="${px.toFixed(1)}" y="${gy}" width="${pw.toFixed(1)}" height="${ph}" rx="16" fill="${BADGE_BG}" stroke="${AMBER}" stroke-width="1.4" stroke-opacity="0.5"/>` +
        `<text x="${(px + pw / 2).toFixed(1)}" y="${gy + 53}" text-anchor="middle" font-family="Roboto Mono" font-weight="bold" font-size="46" fill="${BONE}">${esc(tok)}</text>`,
    )
    if (sl) {
      parts.push(
        `<text x="${(px + pw / 2).toFixed(1)}" y="${gy + ph + 22}" text-anchor="middle" font-family="Poppins" font-weight="500" font-size="13" letter-spacing="1.5" fill="${AMBER}">${sl}</text>`,
      )
    }
    px += pw + 16
  }
  return parts.join('')
}

/** One metric hero (icon + value + label). */
function hero(
  x: number,
  kind: Parameters<typeof badge>[3],
  value: string,
  label: string,
): string {
  const bs = 72
  const by = 372
  const vx = x + bs + 22
  return (
    badge(x, by, bs, kind) +
    `<text x="${vx}" y="${by + 44}" font-family="Roboto Mono" font-weight="bold" font-size="50" fill="${BONE}">${esc(String(value))}</text>` +
    `<text x="${vx}" y="${by + 74}" font-family="Poppins" font-weight="500" font-size="19" letter-spacing="2" fill="${AMBER}">${esc(label)}</text>`
  )
}

/** One time tile (icon + value + label, centred). */
function tile(
  cx: number,
  kind: Parameters<typeof badge>[3],
  value: string,
  label: string,
): string {
  const bs = 56
  const bx = cx - bs / 2
  const by = 560
  return (
    badge(bx, by, bs, kind) +
    `<text x="${cx.toFixed(1)}" y="${by + bs + 44}" text-anchor="middle" font-family="Roboto Mono" font-weight="bold" font-size="34" fill="${BONE}">${esc(String(value))}</text>` +
    `<text x="${cx.toFixed(1)}" y="${by + bs + 74}" text-anchor="middle" font-family="Poppins" font-weight="500" font-size="17" letter-spacing="1.5" fill="${COLD}">${esc(label)}</text>`
  )
}

/** Generate SVG string for the canyoning data-only card (1600×900). */
export function canyoningCard(data: CanyoningCardData): string {
  const S = STRINGS[data.lang]

  // --- header ---
  const title = data.title || S.default_title
  let tsz = 64
  while (tw(title, 'bold', tsz) > CW - 360 && tsz > 34) tsz -= 2
  const titleSvg = `<text x="172" y="128" font-family="Poppins" font-weight="700" font-size="${tsz}" fill="${BONE}">${esc(title)}</text>`

  let chip = ''
  if (data.date) {
    const cw = tw(data.date, 'mono', 22) + 30
    chip =
      `<rect x="${(CXR - cw).toFixed(0)}" y="54" width="${cw.toFixed(0)}" height="42" rx="12" fill="${BADGE_BG}" stroke="${PANEL_STK}" stroke-width="1"/>` +
      `<text x="${(CXR - 15).toFixed(0)}" y="82" text-anchor="end" font-family="Roboto Mono" font-size="23" fill="${BONE}">${esc(data.date)}</text>`
  }

  // --- grade pills ---
  const gradeSvg = gradePills(
    data.grade ?? '—',
    S.g_vert,
    S.g_aqua,
    S.g_commit,
    S.difficulty,
  )

  // --- 3 hero metrics ---
  const heroSvg = [
    hero(CX0 + (CW / 3) * 0, 'vertical', data.desnivel ?? '—', S.desnivel),
    hero(CX0 + (CW / 3) * 1, 'rappel', data.maxRappel ?? '—', S.max_rappel),
    hero(CX0 + (CW / 3) * 2, 'drops', data.rappels ?? '—', S.rappels),
  ].join('')

  // --- times tiles (4 columns) ---
  const ncol = 4
  const tileData: Array<[Parameters<typeof badge>[3], string, string]> = [
    ['hiker', fmtTime(data.approach) ?? '—', S.approach],
    ['canyon', fmtTime(data.inCanyon) ?? '—', S.in_canyon],
    ['return', fmtTime(data.returnTime) ?? '—', S.return],
    ['clock', fmtTime(data.total) ?? '—', S.total],
  ]
  const centers = tileData.map((_, k) => CX0 + (CW / ncol) * (k + 0.5))
  const tilesSvg = tileData
    .map(([k, v, l], i) => tile(centers[i], k, v, l))
    .join('')
  const dividersSvg = Array.from({ length: ncol - 1 }, (_, k) =>
    columnDivider(CX0 + (CW / ncol) * (k + 1), 572, 672),
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
      eyebrow(CX0, 748, S.tech_header) +
      `<text x="${CX0}" y="800" font-family="Poppins" font-size="24">${parts.join(sep)}</text>`
  }

  // Observed flow lives in the difficulty zone, to the right of the grade pills.
  const flowSvg = data.flowLevel
    ? flowRow(
        700,
        214,
        data.flowLevel,
        data.flowRappels,
        data.phenomena ?? [],
        S,
      )
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
<rect x="172" y="58" width="11" height="11" rx="2" fill="${AMBER}"/>
<text x="194" y="69" font-family="Poppins" font-weight="500" font-size="21" letter-spacing="3" fill="${AMBER}">${esc(S.canyon_card)}</text>
${titleSvg}
${chip}
${gradeSvg}
${hRule(CX0, CXR, 342)}
${heroSvg}
${hRule(CX0, CXR, 510)}
${eyebrow(CX0, 547, S.times_header)}${dividersSvg}${tilesSvg}
${hRule(CX0, CXR, 712)}
${techSvg}
${flowSvg}
</svg>`
}

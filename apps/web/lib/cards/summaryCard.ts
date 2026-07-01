import { FONT_STYLE } from './fonts'
import {
  badge,
  columnDivider,
  contours,
  elevationProfile,
  esc,
  eyebrow,
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
import type { SummaryFerrataData, SummaryRouteData } from './types'

const W = 1600
const H = 900
const CX0 = 56
const CXR = W - 56
const CW = CXR - CX0

export type SummaryCardData = SummaryRouteData | SummaryFerrataData

/** Title with optional arrow segments (A → B → C). */
function titleSvg(title: string): string {
  const segs = title.split('→').map((s) => s.trim())
  const arrowW = (sz: number) => sz * 1.05
  const totalW = (sz: number) =>
    segs.reduce((acc, s) => acc + tw(s, 'bold', sz), 0) +
    (segs.length - 1) * arrowW(sz)

  let ts = 50
  while (totalW(ts) > CW - 520 && ts > 26) ts -= 1

  const baseline = 126
  const tx0 = 172
  const parts: string[] = []
  let cur = tx0

  for (let i = 0; i < segs.length; i++) {
    const s = segs[i]
    parts.push(
      `<text x="${cur.toFixed(1)}" y="${baseline}" font-family="Poppins" font-weight="700" font-size="${ts}" fill="${BONE}">${esc(s)}</text>`,
    )
    cur += tw(s, 'bold', ts)
    if (i < segs.length - 1) {
      const aS = cur + ts * 0.3
      const aE = aS + ts * 0.62
      const acy = baseline - ts * 0.3
      const lw = ts * 0.1
      parts.push(
        `<path d="M${aS.toFixed(1)},${acy.toFixed(1)} L${aE.toFixed(1)},${acy.toFixed(1)}" stroke="${AMBER}" stroke-width="${lw.toFixed(1)}" stroke-linecap="round"/>`,
        `<path d="M${(aE - ts * 0.2).toFixed(1)},${(acy - ts * 0.22).toFixed(1)} L${aE.toFixed(1)},${acy.toFixed(1)} L${(aE - ts * 0.2).toFixed(1)},${(acy + ts * 0.22).toFixed(1)}" fill="none" stroke="${AMBER}" stroke-width="${lw.toFixed(1)}" stroke-linejoin="round" stroke-linecap="round"/>`,
      )
      cur += arrowW(ts)
    }
  }
  return parts.join('')
}

/** Standard metric hero (bs=78, by=188). */
function hero(
  x: number,
  kind: Parameters<typeof badge>[3],
  value: string,
  label: string,
  colW: number = CW / 3,
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

/** Generate SVG for a summary card (route / ferrata). */
export function summaryCard(data: SummaryCardData): string {
  const S = STRINGS[data.lang]

  // --- header ---
  const rawTitle = data.title || S.default_title
  const tsvg = titleSvg(rawTitle)

  let chip = ''
  if (data.date) {
    const cw = tw(data.date, 'mono', 22) + 30
    chip =
      `<rect x="${(CXR - cw).toFixed(0)}" y="54" width="${cw.toFixed(0)}" height="42" rx="12" fill="${BADGE_BG}" stroke="${PANEL_STK}" stroke-width="1"/>` +
      `<text x="${(CXR - 15).toFixed(0)}" y="82" text-anchor="end" font-family="Roboto Mono" font-size="23" fill="${BONE}">${esc(data.date)}</text>`
  }

  // --- badge + eyebrow (kind-specific) ---
  const isRoute = data.kind === 'summary-route'
  const badgeKind: Parameters<typeof badge>[3] = isRoute ? 'summit' : 'ferrata'
  const eyebrowText = isRoute ? S.route_summary : S.ferrata_card

  // --- heroes (3 columns) ---
  const heroSvg = isRoute
    ? [
        hero(CX0 + (CW / 3) * 0, 'route', data.dist ?? '—', S.distance),
        hero(CX0 + (CW / 3) * 1, 'climb', data.dplus ?? '—', S.ascent),
        hero(CX0 + (CW / 3) * 2, 'descent', data.dminus ?? '—', S.descent),
      ].join('')
    : [
        hero(CX0 + (CW / 3) * 0, 'ferrata', data.grade ?? '—', S.difficulty),
        hero(CX0 + (CW / 3) * 1, 'cable', data.cable ?? '—', S.cable),
        hero(CX0 + (CW / 3) * 2, 'vertical', data.vertical ?? '—', S.vertical),
      ].join('')

  // --- times tiles (5–6 columns) ---
  type TileEntry = [Parameters<typeof badge>[3], string, string]
  const tileData: TileEntry[] = [
    ['hiker', data.mov ?? '—', S.moving],
    ['pause', data.det ?? '—', S.stopped],
    ['clock', data.tot ?? '—', S.total],
    ['sunrise', data.ini ?? '—', S.start],
    ['sunset', data.fin ?? '—', S.end],
  ]
  if (data.ret) tileData.push(['return', data.ret, S.return])

  const ncol = tileData.length
  const centers = tileData.map((_, k) => CX0 + (CW / ncol) * (k + 0.5))
  const tilesSvg = tileData
    .map(([k, v, l], i) => tile(centers[i], k, v, l))
    .join('')
  const dividersSvg = Array.from({ length: ncol - 1 }, (_, k) =>
    columnDivider(CX0 + (CW / ncol) * (k + 1), 408, 518),
  ).join('')

  // --- elevation profile (drawn from GPX, else placeholder) ---
  const profileY = 602
  const elevation = data.elevation ?? []
  const profilePlaceholder =
    elevation.length >= 2
      ? eyebrow(CX0, profileY, S.profile) +
        elevationProfile(elevation, CX0, CXR, profileY + 32, 860)
      : `<text x="${(W / 2).toFixed(1)}" y="${profileY + 100}" text-anchor="middle" ` +
        `font-family="Poppins" font-size="18" letter-spacing="3" fill="${COLD}" opacity="0.3">` +
        `${esc(S.profile)} · GPX</text>`

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
${badge(56, 46, 96, badgeKind)}
${eyebrow(172, 69, eyebrowText)}
${tsvg}
${chip}
${hRule(CX0, CXR, 336)}
${heroSvg}
${eyebrow(CX0, 383, S.times_header)}${dividersSvg}${tilesSvg}
${hRule(CX0, CXR, 562)}
${profilePlaceholder}
</svg>`
}

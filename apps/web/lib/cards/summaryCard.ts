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
import type {
  SummaryCanyoningData,
  SummaryFerrataData,
  SummaryRouteData,
} from './types'

const W = 1600
const H = 900
const CX0 = 56
const CXR = W - 56
const CW = CXR - CX0

/** Filled elevation polyline spanning [x0,x1] × [top,bottom]. */
function elevationProfile(
  ele: number[],
  x0: number,
  x1: number,
  top: number,
  bottom: number,
): string {
  const min = Math.min(...ele)
  const max = Math.max(...ele)
  const span = max - min || 1
  const n = ele.length
  const pts = ele.map((e, i) => {
    const x = x0 + ((x1 - x0) * i) / (n - 1)
    const y = bottom - ((e - min) / span) * (bottom - top)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const area = `${x0.toFixed(1)},${bottom.toFixed(1)} ${pts.join(' ')} ${x1.toFixed(1)},${bottom.toFixed(1)}`
  return (
    `<polygon points="${area}" fill="${AMBER}" fill-opacity="0.08"/>` +
    `<polyline points="${pts.join(' ')}" fill="none" stroke="${AMBER}" stroke-width="2.5" stroke-opacity="0.75"/>`
  )
}

export type SummaryCardData =
  | SummaryRouteData
  | SummaryFerrataData
  | SummaryCanyoningData

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

/** Grade pills hero (summary variant, ph=58, fs=32). */
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
  // Vertically centre the pills on the icon badge so their row lines up.
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

/** Generate SVG for a summary card (route / ferrata / canyoning). */
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
  let badgeKind: Parameters<typeof badge>[3]
  let eyebrowText: string

  if (data.kind === 'summary-route') {
    badgeKind = 'summit'
    eyebrowText = S.route_summary
  } else if (data.kind === 'summary-ferrata') {
    badgeKind = 'ferrata'
    eyebrowText = S.ferrata_card
  } else {
    badgeKind = 'canyon'
    eyebrowText = S.canyon_card
  }

  // --- heroes (3 columns) ---
  let heroSvg: string

  if (data.kind === 'summary-route') {
    heroSvg = [
      hero(CX0 + (CW / 3) * 0, 'route', data.dist ?? '—', S.distance),
      hero(CX0 + (CW / 3) * 1, 'climb', data.dplus ?? '—', S.ascent),
      hero(CX0 + (CW / 3) * 2, 'descent', data.dminus ?? '—', S.descent),
    ].join('')
  } else if (data.kind === 'summary-ferrata') {
    heroSvg = [
      hero(CX0 + (CW / 3) * 0, 'ferrata', data.grade ?? '—', S.difficulty),
      hero(CX0 + (CW / 3) * 1, 'cable', data.cable ?? '—', S.cable),
      hero(CX0 + (CW / 3) * 2, 'vertical', data.vertical ?? '—', S.vertical),
    ].join('')
  } else {
    // Canyon summary packs four metrics: grade, descent, longest rappel, count.
    const cw4 = CW / 4
    heroSvg =
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
  }

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

  // --- observed flow row (difficulty zone, below the grade hero) ---
  const flowSvg =
    data.kind === 'summary-canyoning' && data.flowLevel
      ? flowRow(
          CX0,
          290,
          data.flowLevel,
          data.flowRappels,
          data.phenomena ?? [],
          S,
        )
      : ''

  // --- tech strip (summary-canyoning only) ---
  let techSvg = ''
  if (data.kind === 'summary-canyoning') {
    const techItems: Array<[string, string]> = []
    if (data.rope) techItems.push([S.rope, data.rope])
    if (data.cars) techItems.push([S.cars, data.cars])
    if (data.season) techItems.push([S.season, data.season])

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
  }

  // --- elevation profile (drawn from GPX, else placeholder) ---
  const profileY = data.kind === 'summary-canyoning' && techSvg ? 672 : 602
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
${techSvg}
${flowSvg}
${profilePlaceholder}
</svg>`
}

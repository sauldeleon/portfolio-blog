import { FONT_STYLE } from './fonts'
import { iconPath } from './icons'
import { contours, esc, tw } from './primitives'
import {
  AMBER,
  AMBER_DK,
  BADGE_BG,
  BG_BOT,
  BG_TOP,
  BONE,
  COLD,
  type Lang,
  PANEL_STK,
  STRINGS,
  TRACK_BG,
} from './theme'
import { categoryIcon } from './waypoints'

const W = 1080
const H = 320

export interface WaypointCardData {
  name: string
  lat: number
  lon: number
  ele: number
  /** Min/max elevation across the set, for the altimeter scale. */
  emin: number
  emax: number
  /** Resolved category key. */
  category: string
  lang: Lang
}

/** Fit a title to `maxW`, breaking into two balanced lines if needed. */
function fitTitle(
  title: string,
  maxW: number,
): { size: number; lines: string[] } {
  const words = title.split(' ')
  for (let size = 60; size >= 34; size -= 2) {
    if (tw(title, 'bold', size) <= maxW) return { size, lines: [title] }
    let best: { sc: number; lines: string[] } | null = null
    for (let cut = 1; cut < words.length; cut++) {
      const l1 = words.slice(0, cut).join(' ')
      const l2 = words.slice(cut).join(' ')
      if (tw(l1, 'bold', size) <= maxW && tw(l2, 'bold', size) <= maxW) {
        const sc = Math.abs(tw(l1, 'bold', size) - tw(l2, 'bold', size))
        if (best === null || sc < best.sc) best = { sc, lines: [l1, l2] }
      }
    }
    if (best) return { size, lines: best.lines }
  }
  const mid = Math.max(1, Math.floor(words.length / 2))
  return {
    size: 34,
    lines: [words.slice(0, mid).join(' '), words.slice(mid).join(' ')],
  }
}

/** Generate the SVG for a single waypoint banner (1080×320). */
export function waypointCard(data: WaypointCardData): string {
  const cats: Record<string, string> = STRINGS[data.lang].categories
  const cat = cats[data.category] ?? cats.info
  const kind = categoryIcon(data.category)

  const bx = 44
  const by = 86
  const bs = 148
  const itx = bx + (bs - 96) / 2
  const ity = by + (bs - 96) / 2
  const CX = 226

  const coords = `${data.lat.toFixed(5)}, ${data.lon.toFixed(5)}`

  const { size: tsize, lines } = fitTitle(data.name, 700)
  let title: string
  if (lines.length === 1) {
    title = `<text x="${CX}" y="178" font-family="Poppins" font-weight="700" font-size="${tsize}" fill="${BONE}">${esc(lines[0])}</text>`
  } else {
    const lh = tsize * 1.16
    title =
      `<text x="${CX}" y="160" font-family="Poppins" font-weight="700" font-size="${tsize}" fill="${BONE}">${esc(lines[0])}</text>` +
      `<text x="${CX}" y="${(160 + lh).toFixed(0)}" font-family="Poppins" font-weight="700" font-size="${tsize}" fill="${BONE}">${esc(lines[1])}</text>`
  }

  const dataY = 280
  const yc = dataY - 9
  const crosshair =
    `<g transform="translate(${CX},${yc - 9})" fill="none" stroke="${COLD}" stroke-width="2.4" stroke-linecap="round">` +
    `<circle cx="9" cy="9" r="8.5"/><path d="M9 -1 L9 3 M9 15 L9 19 M-1 9 L3 9 M15 9 L19 9"/>` +
    `<circle cx="9" cy="9" r="1.6" fill="${COLD}"/></g>`
  const coordsX = CX + 30
  const coordsW = tw(coords, 'mono', 26)
  const triX = coordsX + coordsW + 34
  const tri =
    `<g transform="translate(${triX.toFixed(0)},${yc - 8})">` +
    `<path d="M9 0 L18 16 L0 16 Z" fill="none" stroke="${AMBER}" stroke-width="2.6" stroke-linejoin="round"/></g>`
  const altX = triX + 30
  const dataRow =
    `${crosshair}<text x="${coordsX}" y="${dataY}" font-family="Roboto Mono" font-size="26" fill="${COLD}">${coords}</text>` +
    `${tri}<text x="${altX.toFixed(0)}" y="${dataY}" font-family="Roboto Mono" font-size="26" font-weight="bold" fill="${BONE}">${data.ele} m</text>`

  const ax = 992
  const aTop = 80
  const aBot = 244
  const aH = aBot - aTop
  const rawFrac =
    data.emax > data.emin ? (data.ele - data.emin) / (data.emax - data.emin) : 0
  const frac = Math.max(0, Math.min(1, rawFrac))
  const fillTop = aBot - frac * aH
  const alti =
    `<rect x="${ax - 7}" y="${aTop}" width="14" height="${aH}" rx="7" fill="${TRACK_BG}"/>` +
    `<rect x="${ax - 7}" y="${fillTop.toFixed(1)}" width="14" height="${(aBot - fillTop).toFixed(1)}" rx="7" fill="url(#altgrad)"/>` +
    `<circle cx="${ax}" cy="${fillTop.toFixed(1)}" r="9" fill="${AMBER}" stroke="${BG_BOT}" stroke-width="3"/>` +
    `<text x="${ax}" y="${aTop - 12}" text-anchor="middle" font-family="Roboto Mono" font-size="19" fill="${COLD}">${data.emax}</text>` +
    `<text x="${ax}" y="${aBot + 26}" text-anchor="middle" font-family="Roboto Mono" font-size="19" fill="${COLD}">${data.emin}</text>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
 ${FONT_STYLE}
 <linearGradient id="panel" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${BG_TOP}"/><stop offset="1" stop-color="${BG_BOT}"/></linearGradient>
 <linearGradient id="altgrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${AMBER_DK}"/><stop offset="1" stop-color="${AMBER}"/></linearGradient>
 <clipPath id="pc"><rect x="8" y="8" width="1064" height="304" rx="28"/></clipPath>
</defs>
<rect x="8" y="8" width="1064" height="304" rx="28" fill="url(#panel)" stroke="${PANEL_STK}" stroke-width="1.6"/>
<g clip-path="url(#pc)">${contours(
    [
      [40, 22],
      [120, 30],
      [210, 26],
      [290, 34],
    ],
    8,
    1072,
    22,
  )}</g>
<rect x="8" y="120" width="6" height="80" rx="3" fill="${AMBER}"/>
<rect x="${bx}" y="${by}" width="${bs}" height="${bs}" rx="30" fill="${BADGE_BG}" stroke="${AMBER}" stroke-width="1.6" stroke-opacity="0.55"/>
<g transform="translate(${itx},${ity}) scale(0.96)">${iconPath(kind)}</g>
<rect x="${CX}" y="98" width="11" height="11" rx="2" fill="${AMBER}"/>
<text x="${CX + 22}" y="109" font-family="Poppins" font-weight="500" font-size="22" letter-spacing="3" fill="${AMBER}">${esc(cat)}</text>
${title}
${dataRow}
${alti}
</svg>`
}

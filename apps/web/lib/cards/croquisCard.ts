import type { CroquisObstacle } from './croquisData'
import { glyphFor, river, rowReturn } from './croquisGlyphs'
import {
  type CroquisLayout,
  type CroquisNode,
  layoutCroquis,
} from './croquisLayout'
import { FONT_STYLE } from './fonts'
import { esc } from './primitives'
import {
  AMBER,
  BG_BOT,
  BG_TOP,
  BONE,
  COLD,
  CONTOUR,
  type Lang,
  type LangStrings,
  PANEL_STK,
  SEV_COLORS,
  STRINGS,
} from './theme'

/** Sine-wave contour lines sized to the whole croquis, for background texture. */
export function croquisBackground(width: number, height: number): string {
  const rows = Math.ceil(height / 120)
  let bg = ''
  for (let r = 0; r < rows; r++) {
    const base = 50 + r * 120
    const pts: string[] = []
    for (let i = 0; i <= width; i += 24) {
      pts.push(`${i},${(base + Math.sin(i * 0.012 + r) * 10).toFixed(1)}`)
    }
    bg += `<polyline points="${pts.join(' ')}" fill="none" stroke="${CONTOUR}" stroke-width="1.4" opacity="0.45"/>`
  }
  return bg
}

/** The river connectors plus the access and exit markers. */
export function croquisConnectors(
  layout: CroquisLayout,
  S: LangStrings,
): string {
  if (layout.nodes.length === 0) return ''
  const links = layout.segments
    .map((s) =>
      s.kind === 'return'
        ? rowReturn(s.x1, s.y1, s.x2, s.y2)
        : river(s.x1, s.y1, s.x2, s.y2),
    )
    .join('')
  const { access, exit } = layout
  const accessMark =
    `<text x="${access.x - 70}" y="${access.y - 30}" fill="${COLD}" font-family="Roboto Mono" font-size="13" letter-spacing="2">${esc(S.croquis_access)}</text>` +
    `<path d="M${access.x - 64} ${access.y - 20} l0 14 m-6 -6 l6 6 l6 -6" stroke="${COLD}" stroke-width="2" fill="none"/>`
  const exitMark =
    `<path d="M${exit.x} ${exit.y} l14 0 m-6 -6 l6 6 l-6 6" stroke="${COLD}" stroke-width="2" fill="none"/>` +
    `<text x="${exit.x + 22}" y="${exit.y + 5}" fill="${COLD}" font-family="Roboto Mono" font-size="13" letter-spacing="2">${esc(S.croquis_exit)}</text>`
  return links + accessMark + exitMark
}

/** Short "12 m · ◄ IZDA" descriptor beneath an obstacle. */
function metaLabel(node: CroquisNode, S: LangStrings): string {
  const parts: string[] = []
  if (node.obstacle.meters != null) parts.push(`${node.obstacle.meters} m`)
  if (node.obstacle.side === 'left') parts.push(`◄ ${S.side_left}`)
  else if (node.obstacle.side === 'right') parts.push(`${S.side_right} ►`)
  return parts.join('  ·  ')
}

/** Title-case a category label (e.g. "RÁPEL" → "Rápel"). */
function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase()
}

/**
 * The name shown above an obstacle: both categories for a combo (e.g.
 * "Salto / Rápel"), the rappel category for a rappel, else the first title word.
 */
function nodeLabel(node: CroquisNode, S: LangStrings): string {
  if (node.obstacle.type === 'salto-rapel') {
    return `${titleCase(S.categories.salto)} / ${titleCase(S.categories.rappel)}`
  }
  if (node.obstacle.type === 'rapel') return titleCase(S.categories.rappel)
  return node.obstacle.title.split(/\s+/)[0] || '—'
}

/** Glyph + severity dot + name + metrics for one obstacle (no hit region). */
export function croquisNodeContent(node: CroquisNode, S: LangStrings): string {
  const sev = SEV_COLORS[node.obstacle.severity]
  const glyph = glyphFor(
    node.obstacle.type,
    node.x,
    node.yTop,
    node.endX,
    node.yBot,
  )
  const meta = metaLabel(node, S)
  const metaSvg = meta
    ? `<text x="${((node.x + node.endX) / 2).toFixed(1)}" y="${node.yBot + 30}" text-anchor="middle" fill="${COLD}" font-family="Roboto Mono" font-size="12">${esc(meta)}</text>`
    : ''
  return (
    glyph +
    `<circle cx="${node.x}" cy="${node.yTop - 28}" r="5" fill="${sev}"/>` +
    `<text x="${node.x + 11}" y="${node.yTop - 23}" fill="${BONE}" font-family="Poppins" font-weight="700" font-size="15">${esc(nodeLabel(node, S))}</text>` +
    metaSvg
  )
}

/**
 * Render the full static croquis SVG for a set of obstacles, ready to be
 * rasterised to a PNG. `width` sets the drawing width (serpentine rows fill it).
 */
export function croquisCard(
  obstacles: CroquisObstacle[],
  lang: Lang,
  width?: number,
): { svg: string; width: number; height: number } {
  const S = STRINGS[lang]
  const layout = layoutCroquis(obstacles, width)
  const W = layout.width
  const H = layout.height
  const nodes = layout.nodes.map((n) => croquisNodeContent(n, S)).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
 ${FONT_STYLE}
 <linearGradient id="panel" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${BG_TOP}"/><stop offset="1" stop-color="${BG_BOT}"/></linearGradient>
 <clipPath id="pc"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="28"/></clipPath>
</defs>
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="28" fill="url(#panel)" stroke="${PANEL_STK}" stroke-width="1.6"/>
<g clip-path="url(#pc)">${croquisBackground(W, H)}</g>
<rect x="8" y="80" width="6" height="80" rx="3" fill="${AMBER}"/>
${croquisConnectors(layout, S)}
${nodes}
</svg>`

  return { svg, width: W, height: H }
}

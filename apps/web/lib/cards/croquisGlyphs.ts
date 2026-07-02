import type { CroquisType } from './croquisData'
import { AMBER, BONE, PANEL_STK, WATER, WATER_DEEP } from './theme'

const isRapel = (t: CroquisType) => t === 'rapel' || t === 'salto-rapel'
const isSalto = (t: CroquisType) => t === 'salto' || t === 'salto-rapel'
const isTobogan = (t: CroquisType) => t === 'tobogan'

/** Three stacked wavy strokes suggesting falling water between two heights. */
export function waterfall(x: number, yTop: number, yBot: number): string {
  const seg = (yBot - yTop) / 3
  let s = ''
  for (let i = -1; i <= 1; i++) {
    const xi = x + i * 7
    s += `<path d="M${xi} ${yTop} q6 ${seg} 0 ${seg} q-6 ${seg} 0 ${seg} q6 ${seg} 0 ${seg}" fill="none" stroke="${WATER}" stroke-width="2" stroke-opacity="${0.5 - Math.abs(i) * 0.12}" stroke-linecap="round"/>`
  }
  return s
}

/** Rappel: a rock lip with a waterfall, an anchor and a dashed rope line. */
export function glyphRapel(x: number, yTop: number, yBot: number): string {
  const w = -24
  return (
    `<path d="M${x} ${yTop} L${x + w} ${yTop} L${x + w - 6} ${yBot} L${x} ${yBot} Z" fill="${PANEL_STK}" stroke="#405b6c" stroke-width="1"/>` +
    waterfall(x, yTop, yBot) +
    `<circle cx="${x}" cy="${yTop}" r="4" fill="${AMBER}"/>` +
    `<path d="M${x - 7} ${yTop - 2} L${x} ${yTop - 11} L${x + 7} ${yTop - 2}" fill="none" stroke="${AMBER}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<line x1="${x}" y1="${yTop}" x2="${x}" y2="${yBot}" stroke="${AMBER}" stroke-width="2.4" stroke-dasharray="1 6" stroke-linecap="round"/>`
  )
}

/** Slide: a smooth chute of rock with the water tracing its curve. */
export function glyphTobogan(
  x: number,
  yTop: number,
  xEnd: number,
  yBot: number,
): string {
  const c1x = x + (xEnd - x) * 0.15
  const c2x = x + (xEnd - x) * 0.6
  const off = 15
  const top = `M${x} ${yTop} C ${c1x} ${yTop} ${c2x} ${yBot} ${xEnd} ${yBot}`
  const fill = `${top} L ${xEnd} ${yBot + off} C ${c2x} ${yBot + off} ${c1x} ${yTop + off} ${x} ${yTop + off} Z`
  return (
    `<path d="${fill}" fill="${PANEL_STK}" fill-opacity="0.55"/>` +
    `<path d="M${x} ${yTop + off} C ${c1x} ${yTop + off} ${c2x} ${yBot + off} ${xEnd} ${yBot + off}" fill="none" stroke="#3d5b6b" stroke-width="2"/>` +
    `<path d="${top}" fill="none" stroke="${WATER}" stroke-width="3" stroke-linecap="round"/>`
  )
}

/** Jump: a dashed leap arc from a take-off ledge into a rippling pool. */
export function glyphSalto(
  x: number,
  yTop: number,
  xEnd: number,
  yBot: number,
): string {
  const midx = (x + xEnd) / 2
  const apex = yTop - 28
  return (
    `<path d="M${x} ${yTop} Q ${midx} ${apex} ${xEnd} ${yBot - 6}" fill="none" stroke="${BONE}" stroke-width="2.2" stroke-dasharray="7 6" stroke-opacity="0.85"/>` +
    `<path d="M${x - 4} ${yTop} l8 0" stroke="${PANEL_STK}" stroke-width="6" stroke-linecap="round"/>` +
    `<ellipse cx="${xEnd}" cy="${yBot + 6}" rx="30" ry="11" fill="${WATER_DEEP}"/>` +
    `<ellipse cx="${xEnd}" cy="${yBot + 6}" rx="30" ry="11" fill="none" stroke="${WATER}" stroke-width="1.5" opacity="0.8"/>` +
    `<path d="M${xEnd - 14} ${yBot + 4} q7 5 14 0 M${xEnd - 9} ${yBot + 9} q5 4 10 0" stroke="${WATER}" stroke-width="1.3" fill="none" opacity="0.7"/>`
  )
}

/** The river course between two points: a smooth S-curve of flowing water. */
export function river(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  return `<path class="flow" d="M${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" fill="none" stroke="${WATER}" stroke-width="3.5" stroke-linecap="round" opacity="0.9"/>`
}

/**
 * Carriage return: the river dropping from the right end of one row back to
 * the left of the next, a fainter dashed sweep so it reads as a continuation.
 */
export function rowReturn(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const my = (y1 + y2) / 2
  return `<path class="flow" d="M${x1} ${y1} C ${x1 + 40} ${my} ${x2 - 40} ${my} ${x2} ${y2}" fill="none" stroke="${WATER}" stroke-width="3" stroke-linecap="round" opacity="0.7" stroke-dasharray="2 7"/>`
}

/** The glyph(s) for an obstacle at its position (combos stack jump + rappel). */
export function glyphFor(
  type: CroquisType,
  x: number,
  yTop: number,
  endX: number,
  yBot: number,
): string {
  if (isRapel(type) && isSalto(type)) {
    return glyphSalto(x, yTop, endX, yBot) + glyphRapel(x, yTop, yBot)
  }
  if (isRapel(type)) return glyphRapel(x, yTop, yBot)
  if (isTobogan(type)) return glyphTobogan(x, yTop, endX, yBot)
  return glyphSalto(x, yTop, endX, yBot)
}

/** A larger illustration of the obstacle type, drawn for the hover popover. */
export function scene(type: CroquisType): string {
  const sky = `<rect width="260" height="128" fill="#0a1218"/><path d="M0 96 Q40 78 80 92 T160 88 T260 96 L260 128 L0 128Z" fill="#132330"/>`
  if (isRapel(type) && isSalto(type)) {
    return `<svg viewBox="0 0 260 128">${sky}
      <path d="M150 8 L210 8 L210 128 L150 128 Z" fill="${PANEL_STK}"/>
      <path d="M60 40 Q120 4 148 118" stroke="${BONE}" stroke-width="2.2" stroke-dasharray="7 6" fill="none"/>
      <line x1="150" y1="12" x2="150" y2="104" stroke="${AMBER}" stroke-width="2.5" stroke-dasharray="2 6"/>
      <circle cx="150" cy="12" r="4" fill="${AMBER}"/>
      <ellipse cx="150" cy="118" rx="30" ry="8" fill="${WATER_DEEP}"/></svg>`
  }
  if (isRapel(type)) {
    return `<svg viewBox="0 0 260 128">${sky}
      <path d="M150 8 L210 8 L210 128 L150 128 Z" fill="${PANEL_STK}"/>
      <path d="M158 8 q6 30 0 60 q-6 30 0 60" stroke="${WATER}" stroke-width="3" fill="none" opacity="0.7"/>
      <path d="M168 8 q6 30 0 60 q-6 30 0 60" stroke="${WATER}" stroke-width="3" fill="none" opacity="0.4"/>
      <line x1="150" y1="12" x2="150" y2="104" stroke="${AMBER}" stroke-width="2.5" stroke-dasharray="2 6"/>
      <circle cx="150" cy="12" r="4" fill="${AMBER}"/>
      <ellipse cx="150" cy="118" rx="30" ry="8" fill="${WATER_DEEP}"/>
      <circle cx="146" cy="80" r="6" fill="${BONE}"/><path d="M146 86 l0 14 M146 90 l-8 6 M146 90 l8 6 M146 100 l-6 12 M146 100 l6 12" stroke="${BONE}" stroke-width="2" fill="none"/></svg>`
  }
  if (isTobogan(type)) {
    return `<svg viewBox="0 0 260 128">${sky}
      <path d="M20 30 C 90 30 120 96 240 100 L240 116 C120 112 90 46 20 46 Z" fill="${PANEL_STK}" fill-opacity="0.7"/>
      <path d="M20 30 C 90 30 120 96 240 100" stroke="${WATER}" stroke-width="4" fill="none"/>
      <ellipse cx="236" cy="112" rx="22" ry="7" fill="${WATER_DEEP}"/>
      <circle cx="120" cy="60" r="6" fill="${BONE}"/><path d="M120 66 l6 12 M120 70 l-10 2 M126 78 l8 4" stroke="${BONE}" stroke-width="2" fill="none"/></svg>`
  }
  return `<svg viewBox="0 0 260 128">${sky}
      <path d="M20 40 l40 0 l0 88 l-40 0Z" fill="${PANEL_STK}"/>
      <path d="M60 40 Q140 -6 210 108" stroke="${BONE}" stroke-width="2.4" stroke-dasharray="7 6" fill="none"/>
      <ellipse cx="210" cy="116" rx="34" ry="10" fill="${WATER_DEEP}"/>
      <ellipse cx="210" cy="116" rx="34" ry="10" fill="none" stroke="${WATER}"/>
      <path d="M196 114 q14 6 28 0 M202 120 q8 4 16 0" stroke="${WATER}" fill="none" opacity="0.7"/>
      <g transform="translate(132,34) rotate(20)"><circle cx="0" cy="0" r="6" fill="${BONE}"/><path d="M0 6 l0 14 M0 9 l-9 4 M0 9 l9 4 M0 20 l-7 10 M0 20 l7 10" stroke="${BONE}" stroke-width="2" fill="none"/></g></svg>`
}

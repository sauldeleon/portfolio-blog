'use client'

import { useMemo, useState } from 'react'

import { AMBER, findPeaks, landmarkKeys, profilePoint } from '@web/lib/cards'
import type { CardProfile, Lang, RouteLandmark } from '@web/lib/cards'

import { StyledProfileLayer } from './InteractiveCardMap.styles'

const LABEL_FONT = 24
const LABEL_H = 38
/** Roboto Mono advance at 24 px, to size the label box without measuring. */
const CHAR_W = 14.5

export function formatAltitude(metres: number, lang: Lang): string {
  return `${Math.round(metres).toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')} m`
}

/** A marked spot: a named summit or col, or just a high point. */
type Marker = Pick<RouteLandmark, 'kind' | 'index' | 'name'> & { ele: number }

/** ▲ for summits, ▼ for cols, centred on (x, y). */
function markerPath(kind: Marker['kind'], x: number, y: number): string {
  const r = 9
  if (kind === 'point') {
    return `M${x - 11},${y} a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0`
  }
  const h = r * 0.85
  return kind === 'peak'
    ? `M${x},${y - h} L${x + r},${y + h} L${x - r},${y + h} Z`
    : `M${x},${y + h} L${x + r},${y - h} L${x - r},${y - h} Z`
}

export interface ElevationLayerProps {
  profile: CardProfile
  lang: Lang
}

/**
 * Altitude read-out over a card's elevation profile: a guide follows the
 * pointer along the profile, and the summits carry markers that show their
 * altitude on hover, tap or keyboard focus. Drawn in the card's user-space so
 * it stays aligned at any size.
 */
export function ElevationLayer({ profile, lang }: ElevationLayerProps) {
  const [index, setIndex] = useState<number | null>(null)
  // Named summits and cols when the card has them, else the highest points.
  const markers = useMemo<Marker[]>(
    () =>
      profile.landmarks?.length
        ? profile.landmarks.filter((l) => l.index < profile.elevation.length)
        : findPeaks(profile.elevation).map((i) => ({
            kind: 'peak',
            index: i,
            ele: profile.elevation[i],
          })),
    [profile.landmarks, profile.elevation],
  )
  const keys = landmarkKeys(markers)
  // The card draws named landmarks itself; here they only catch the pointer.
  const drawnByCard = Boolean(profile.landmarks?.length)
  const last = profile.elevation.length - 1

  function indexAt(e: React.PointerEvent<SVGRectElement>): number {
    const box = e.currentTarget.getBoundingClientRect()
    const ratio = box.width > 0 ? (e.clientX - box.left) / box.width : 0
    return Math.round(Math.min(1, Math.max(0, ratio)) * last)
  }

  const point = index === null ? null : profilePoint(profile, index)
  const marker = markers.find((m) => m.index === index)
  const altitude = marker ? marker.ele : profile.elevation[index ?? 0]
  const label =
    index === null
      ? ''
      : [marker?.name, formatAltitude(altitude, lang)]
          .filter(Boolean)
          .join(' · ')
  const labelW = label.length * CHAR_W + 24
  // Above the point, kept inside the profile area horizontally.
  const labelX = point
    ? Math.min(profile.x1 - labelW, Math.max(profile.x0, point.x - labelW / 2))
    : 0
  const labelY = point
    ? Math.max(profile.top - LABEL_H - 6, point.y - LABEL_H - 16)
    : 0

  return (
    <StyledProfileLayer data-testid="card-profile-layer">
      <rect
        className="hit"
        x={profile.x0}
        y={profile.top - 24}
        width={profile.x1 - profile.x0}
        height={profile.bottom - profile.top + 24}
        fill="transparent"
        onPointerMove={(e) => setIndex(indexAt(e))}
        onPointerDown={(e) => setIndex(indexAt(e))}
        onPointerLeave={() => setIndex(null)}
        data-testid="card-profile-hit"
      />
      {markers.map((m, i) => {
        const p = profilePoint(profile, m.index)
        const altitude = formatAltitude(m.ele, lang)
        return (
          <path
            key={keys[i]}
            className="peak"
            d={markerPath(m.kind, p.x, p.y)}
            // Without card-drawn landmarks these are the highest points.
            fill={drawnByCard ? 'transparent' : AMBER}
            stroke={drawnByCard ? 'transparent' : AMBER}
            strokeWidth={drawnByCard ? 14 : 3}
            strokeLinejoin="round"
            tabIndex={0}
            role="img"
            aria-label={m.name ? `${m.name}, ${altitude}` : altitude}
            onPointerEnter={() => setIndex(m.index)}
            onPointerLeave={() => setIndex(null)}
            onFocus={() => setIndex(m.index)}
            onBlur={() => setIndex(null)}
            data-kind={m.kind}
            data-testid={`card-peak-${m.index}`}
          />
        )
      })}
      {point && (
        <g className="readout" data-testid="card-profile-readout">
          <line
            x1={point.x}
            x2={point.x}
            y1={profile.top - 8}
            y2={profile.bottom}
            stroke={AMBER}
            strokeOpacity={0.5}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <circle cx={point.x} cy={point.y} r={6} fill={AMBER} />
          <rect
            x={labelX}
            y={labelY}
            width={labelW}
            height={LABEL_H}
            rx={8}
            fill="#0E1820"
            stroke={AMBER}
            strokeWidth={1.5}
            data-testid="card-profile-label-box"
          />
          <text
            x={labelX + labelW / 2}
            y={labelY + LABEL_H / 2 + LABEL_FONT * 0.35}
            textAnchor="middle"
            fontFamily="'Roboto Mono', monospace"
            fontSize={LABEL_FONT}
            fontWeight="bold"
            fill="#F2EEE6"
            data-testid="card-profile-label"
          >
            {label}
          </text>
        </g>
      )}
    </StyledProfileLayer>
  )
}

'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AMBER } from '@web/lib/cards'
import type { CardProfile, CardZone, Lang } from '@web/lib/cards'

import { ElevationLayer } from './ElevationLayer'
import {
  StyledCard,
  StyledFrame,
  StyledHint,
  StyledOverlay,
  StyledPopover,
  StyledScroll,
  StyledZone,
} from './InteractiveCardMap.styles'

const notWide = () => false
const noLabel = () => ''
const noPopover = () => null

const W = 1600
const H = 900

export interface InteractiveCardMapProps {
  /** The static card SVG (1600×900). */
  svg: string
  /** Interactive hit-zones laid over the card. */
  zones: CardZone[]
  /**
   * How a popover opens. `hover` (default) opens on hover and focus; `click`
   * is tap/click-only (no hover), for read contexts like a post.
   */
  interaction?: 'hover' | 'click'
  /** Whether the given zone's popover uses the wider layout. */
  isWide?: (zone: CardZone) => boolean
  /** Accessible label for a zone's hit target. */
  zoneLabel?: (zone: CardZone) => string
  /** Popover content for the active zone. */
  renderPopover?: (zone: CardZone) => ReactNode
  /** Optional caption inviting the reader to click the interactive zones. */
  hint?: string
  /** The card's elevation profile, to read altitudes off it. */
  profile?: CardProfile
  /** Language of the altitude read-out. */
  lang?: Lang
}

/**
 * The interactive layer shared by every summary card: the static SVG plus an
 * explain-on-click/hover popover over each hit-zone. It owns the hover/focus,
 * outside-close and positioning behaviour; callers supply the zones and the
 * popover content. Presentational and read-only.
 */
export function InteractiveCardMap({
  svg,
  zones,
  interaction = 'hover',
  // Only cards with zones need these; a profile-only card leaves them out.
  isWide = notWide,
  zoneLabel = noLabel,
  renderPopover = noPopover,
  hint,
  profile,
  lang = 'en',
}: InteractiveCardMapProps) {
  const hoverEnabled = interaction !== 'click'
  const [active, setActive] = useState<CardZone | null>(null)
  const [pos, setPos] = useState({ left: 0, top: 0 })
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function cancelClose() {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  function scheduleClose() {
    cancelClose()
    closeTimer.current = setTimeout(() => setActive(null), 160)
  }
  useEffect(() => () => cancelClose(), [])

  // Portalled to <body> so position:fixed anchors to the viewport, not to a
  // transformed ancestor (e.g. the centred insert modal).
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // A tap outside any zone/popover (or Escape) closes it.
  useEffect(() => {
    if (active === null) return
    const close = () => setActive(null)
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element
      if (!target.closest('[data-card-zone],[data-card-popover]')) {
        close()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [active])

  function open(zone: CardZone, target: SVGGElement) {
    cancelClose()
    const r = target.getBoundingClientRect()
    const wide = isWide(zone)
    const pw = wide ? 360 : 300
    const ph = wide ? 400 : 160
    const gap = 12
    let left = r.left + r.width / 2 - pw / 2
    left = Math.max(8, Math.min(window.innerWidth - pw - 8, left))
    let top = r.top - gap - ph
    if (top < 8) top = Math.min(r.bottom + gap, window.innerHeight - ph - 8)
    top = Math.max(8, top)
    setPos({ left, top })
    setActive(zone)
  }

  const popover = (
    <StyledPopover
      data-testid="card-popover"
      data-card-popover=""
      data-open={active !== null}
      $wide={active ? isWide(active) : true}
      style={{ left: pos.left, top: pos.top }}
      onMouseEnter={hoverEnabled ? cancelClose : undefined}
      onMouseLeave={hoverEnabled ? scheduleClose : undefined}
    >
      {active && renderPopover(active)}
    </StyledPopover>
  )

  return (
    <>
      <StyledFrame>
        <StyledScroll $ratio={W / H}>
          <StyledCard
            data-testid="card-svg"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <StyledOverlay
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            data-testid="card-overlay"
          >
            {profile && <ElevationLayer profile={profile} lang={lang} />}
            {zones.map((zone) => (
              <StyledZone
                key={zone.id}
                tabIndex={0}
                role="button"
                aria-label={zoneLabel(zone)}
                data-card-zone=""
                data-testid={`card-zone-${zone.id}`}
                onMouseEnter={
                  hoverEnabled ? (e) => open(zone, e.currentTarget) : undefined
                }
                onMouseLeave={hoverEnabled ? scheduleClose : undefined}
                onFocus={(e) => open(zone, e.currentTarget)}
                onBlur={(e) => {
                  if (
                    (e.relatedTarget as Element | null)?.closest(
                      '[data-card-popover]',
                    )
                  ) {
                    return
                  }
                  scheduleClose()
                }}
                onClick={(e) => open(zone, e.currentTarget)}
              >
                <rect
                  className="glow"
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  rx={10}
                  fill={AMBER}
                  fillOpacity={0.18}
                />
                <rect
                  className="ring"
                  x={zone.x - 2}
                  y={zone.y - 2}
                  width={zone.w + 4}
                  height={zone.h + 4}
                  rx={11}
                  fill="none"
                  stroke={AMBER}
                  strokeWidth={1.5}
                />
                <rect
                  className="hit"
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  fill="transparent"
                />
                <circle
                  className="marker"
                  data-testid={`card-marker-${zone.id}`}
                  cx={zone.x + zone.w - 9}
                  cy={zone.y + 9}
                  r={7}
                  stroke="#0E1820"
                  strokeWidth={2}
                />
              </StyledZone>
            ))}
          </StyledOverlay>
        </StyledScroll>
      </StyledFrame>

      {hint && <StyledHint data-testid="card-hint">{hint}</StyledHint>}

      {mounted && createPortal(popover, document.body)}
    </>
  )
}

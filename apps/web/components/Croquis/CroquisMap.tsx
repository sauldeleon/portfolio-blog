'use client'

import type { PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { BlurUp, blurPlaceholderUrl, isOnContainedImage } from '@sdlgr/blur-up'
import { ChevronIcon } from '@sdlgr/icons'

import {
  AMBER,
  CROQUIS_HEADER_H,
  CROQUIS_WIDTH,
  FONT_STYLE,
  SEV_COLORS,
  STRINGS,
  croquisBackground,
  croquisConnectors,
  croquisHeader,
  croquisNodeContent,
  layoutCroquis,
  scene,
} from '@web/lib/cards'
import type {
  CroquisObstacle,
  CroquisType,
  Lang,
  LangStrings,
} from '@web/lib/cards'
import { cloudinaryTransform } from '@web/lib/cloudinary/transformUrl'

import {
  StyledChip,
  StyledChips,
  StyledFrame,
  StyledKind,
  StyledLightbox,
  StyledLightboxClose,
  StyledLightboxFrame,
  StyledLightboxNav,
  StyledName,
  StyledNotes,
  StyledObstacle,
  StyledPopover,
  StyledScroll,
  StyledThumbButton,
  StyledThumbs,
} from './CroquisMap.styles'

const FLOW_STYLE =
  '<style>.flow{stroke-dasharray:10 14;animation:croquis-flow 1.6s linear infinite}' +
  '@keyframes croquis-flow{to{stroke-dashoffset:-48}}' +
  '@media (prefers-reduced-motion: reduce){.flow{animation:none}}</style>'

/** Category label for the popover heading. */
function kindLabel(type: CroquisType, s: LangStrings): string {
  const c = s.categories
  if (type === 'salto-rapel') return `${c.salto} / ${c.rappel}`
  if (type === 'rapel') return c.rappel
  if (type === 'tobogan') return c.tobogan
  return c.salto
}

function sevLabel(
  severity: CroquisObstacle['severity'],
  s: LangStrings,
): string {
  if (severity === 'danger') return s.sev_danger
  if (severity === 'caution') return s.sev_caution
  return s.sev_easy
}

export interface CroquisMapProps {
  obstacles: CroquisObstacle[]
  lang: Lang
  /** Optional card-style title shown above the map. */
  title?: string
  /**
   * How a popover opens. `hover` (default) opens on mouse hover and focus;
   * `click` is tap/click-only (no hover), for read contexts like a post.
   */
  interaction?: 'hover' | 'click'
}

/**
 * The interactive croquis map: the river course drawn from obstacles, with a
 * click/hover/focus popover per element (its photo when available, else a drawn
 * scene). Presentational and read-only — export/upload live in the caller.
 */
export function CroquisMap({
  obstacles,
  lang,
  title,
  interaction = 'hover',
}: CroquisMapProps) {
  const strings = STRINGS[lang]
  const hoverEnabled = interaction !== 'click'
  const headerText = title?.trim() ?? ''
  const headerH = headerText ? CROQUIS_HEADER_H : 0
  const [active, setActive] = useState<number | null>(null)
  const [pos, setPos] = useState({ left: 0, top: 0 })
  // Which image of the active obstacle's gallery is shown in the popover.
  const [imgIndex, setImgIndex] = useState(0)
  // Start x of a touch/pointer swipe over the popover image.
  const swipeStartX = useRef<number | null>(null)
  // Fullscreen image viewer (lightbox); snapshots its own photos so it survives
  // the popover closing.
  const [lightbox, setLightbox] = useState<{
    photos: string[]
    index: number
  } | null>(null)
  // Deferred close so the mouse can travel from the obstacle into the popover
  // (which sits a few px away) without it closing in the gap.
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
  // The popover is portalled to <body> so its position:fixed is anchored to the
  // viewport, not to a transformed ancestor (e.g. the centred insert modal).
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Touch has no hover: a tap opens the popover, and a tap outside any obstacle
  // (or Escape) closes it. On desktop, hover still opens/closes it directly.
  useEffect(() => {
    if (active === null) return
    const close = () => setActive(null)
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element
      if (!target.closest('[data-croquis-obstacle],[data-croquis-popover]')) {
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

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox])

  const layout = useMemo(
    () => layoutCroquis(obstacles, CROQUIS_WIDTH),
    [obstacles],
  )
  const bg = useMemo(
    () => croquisBackground(layout.width, layout.height + headerH),
    [layout, headerH],
  )
  const connectors = useMemo(
    () => croquisConnectors(layout, strings),
    [layout, strings],
  )

  function open(index: number, target: SVGGElement) {
    cancelClose()
    const r = target.getBoundingClientRect()
    const hasPhoto = Boolean(obstacles[index].photos?.length)
    const pw = hasPhoto ? 320 : 260
    const ph = hasPhoto ? 320 : 250
    const gap = 12
    let left = r.left + r.width / 2 - pw / 2
    left = Math.max(8, Math.min(window.innerWidth - pw - 8, left))
    let top = r.top - gap - ph
    if (top < 8) top = Math.min(r.bottom + gap, window.innerHeight - ph - 8)
    top = Math.max(8, top)
    setPos({ left, top })
    setImgIndex(0)
    setActive(index)
  }

  const obstacle = active !== null ? obstacles[active] : null
  const photos = obstacle?.photos ?? []

  function onMediaPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    swipeStartX.current = e.clientX
  }
  // A horizontal drag switches image; a plain tap/click opens the fullscreen
  // viewer. Distinguished by the horizontal distance travelled.
  function onMediaPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const start = swipeStartX.current
    swipeStartX.current = null
    if (start === null || photos.length === 0) return
    const dx = e.clientX - start
    if (Math.abs(dx) >= 30) {
      if (photos.length > 1) {
        setImgIndex(
          dx < 0
            ? (imgIndex + 1) % photos.length
            : (imgIndex - 1 + photos.length) % photos.length,
        )
      }
      return
    }
    setLightbox({ photos, index: imgIndex })
  }
  function lightboxStep(delta: number) {
    setLightbox(
      (lb) =>
        lb && {
          photos: lb.photos,
          index: (lb.index + delta + lb.photos.length) % lb.photos.length,
        },
    )
  }

  const popover = (
    <StyledPopover
      data-testid="croquis-popover"
      data-croquis-popover=""
      data-open={obstacle !== null}
      $hasPhoto={photos.length > 0}
      style={{ left: pos.left, top: pos.top }}
      onMouseEnter={hoverEnabled ? cancelClose : undefined}
      onMouseLeave={hoverEnabled ? scheduleClose : undefined}
    >
      {obstacle && (
        <>
          <div
            className="media"
            data-testid="croquis-media"
            style={photos.length > 0 ? { cursor: 'zoom-in' } : undefined}
            onPointerDown={onMediaPointerDown}
            onPointerUp={onMediaPointerUp}
          >
            {photos.length > 0 ? (
              <BlurUp
                key={photos[imgIndex]}
                fill
                objectFit="cover"
                placeholder={blurPlaceholderUrl(photos[imgIndex])}
              >
                {(image) => (
                  <img
                    src={cloudinaryTransform(
                      photos[imgIndex],
                      'f_auto,q_auto,w_640',
                    )}
                    alt={obstacle.title}
                    {...image}
                  />
                )}
              </BlurUp>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: scene(obstacle.type) }} />
            )}
          </div>
          {photos.length > 1 && (
            <StyledThumbs>
              {photos.map((p, i) => {
                // Tapping a thumbnail moves focus off the obstacle, which
                // schedules a close. Cancel it here (works on touch, where the
                // blur's relatedTarget is unreliable) so the popover stays open.
                const pick = () => {
                  cancelClose()
                  setImgIndex(i)
                }
                return (
                  <StyledThumbButton
                    key={i}
                    type="button"
                    $active={i === imgIndex}
                    onMouseEnter={pick}
                    onFocus={pick}
                    onClick={pick}
                    aria-label={`Image ${i + 1}`}
                    data-testid={`croquis-thumb-${i}`}
                  >
                    <img
                      src={cloudinaryTransform(
                        p,
                        'f_auto,q_auto,w_96,h_72,c_fill',
                      )}
                      alt=""
                    />
                  </StyledThumbButton>
                )
              })}
            </StyledThumbs>
          )}
          <div className="body">
            <StyledKind>{kindLabel(obstacle.type, strings)}</StyledKind>
            <StyledName>{obstacle.title}</StyledName>
            <StyledChips>
              {obstacle.meters !== null && (
                <StyledChip>{obstacle.meters} m</StyledChip>
              )}
              {obstacle.side && (
                <StyledChip>
                  {obstacle.side === 'left'
                    ? strings.side_left
                    : strings.side_right}
                </StyledChip>
              )}
              <StyledChip>
                <span
                  className="dot"
                  style={{ background: SEV_COLORS[obstacle.severity] }}
                />
                {sevLabel(obstacle.severity, strings)}
              </StyledChip>
            </StyledChips>
            {obstacle.notes.length > 0 && (
              <StyledNotes>
                {obstacle.notes.map((note, i) => (
                  <li key={i}>{note.text}</li>
                ))}
              </StyledNotes>
            )}
          </div>
        </>
      )}
    </StyledPopover>
  )

  return (
    <>
      <StyledFrame>
        <StyledScroll $ratio={layout.width / (layout.height + headerH)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${layout.width} ${layout.height + headerH}`}
            preserveAspectRatio="xMidYMid meet"
            data-testid="croquis-svg"
          >
            <defs
              dangerouslySetInnerHTML={{ __html: FONT_STYLE + FLOW_STYLE }}
            />
            <g dangerouslySetInnerHTML={{ __html: bg }} />
            {headerText && (
              <g
                data-testid="croquis-title"
                dangerouslySetInnerHTML={{ __html: croquisHeader(headerText) }}
              />
            )}
            <g transform={`translate(0, ${headerH})`}>
              <g dangerouslySetInnerHTML={{ __html: connectors }} />
              {layout.nodes.map((node) => (
                <StyledObstacle
                  key={node.index}
                  tabIndex={0}
                  role="button"
                  aria-label={node.obstacle.title}
                  data-croquis-obstacle=""
                  data-testid={`croquis-obstacle-${node.index}`}
                  onMouseEnter={
                    hoverEnabled
                      ? (e) => open(node.index, e.currentTarget)
                      : undefined
                  }
                  onMouseLeave={hoverEnabled ? scheduleClose : undefined}
                  onFocus={(e) => open(node.index, e.currentTarget)}
                  onBlur={(e) => {
                    // Clicking a popover control (e.g. a gallery thumbnail)
                    // blurs the obstacle; don't close when focus stays inside
                    // the popover.
                    if (
                      (e.relatedTarget as Element | null)?.closest(
                        '[data-croquis-popover]',
                      )
                    ) {
                      return
                    }
                    scheduleClose()
                  }}
                  onClick={(e) => open(node.index, e.currentTarget)}
                >
                  <rect
                    className="glow"
                    x={node.box.x}
                    y={node.box.y}
                    width={node.box.w}
                    height={node.box.h}
                    rx={12}
                    fill={AMBER}
                    fillOpacity={0.1}
                  />
                  <g
                    dangerouslySetInnerHTML={{
                      __html: croquisNodeContent(node, strings),
                    }}
                  />
                  <rect
                    className="ring"
                    x={node.box.x - 2}
                    y={node.box.y - 2}
                    width={node.box.w + 4}
                    height={node.box.h + 4}
                    rx={13}
                    fill="none"
                    stroke={AMBER}
                    strokeWidth={1.5}
                  />
                  <rect
                    className="hit"
                    x={node.box.x}
                    y={node.box.y}
                    width={node.box.w}
                    height={node.box.h}
                    fill="transparent"
                  />
                </StyledObstacle>
              ))}
            </g>
          </svg>
        </StyledScroll>
      </StyledFrame>

      {mounted && createPortal(popover, document.body)}
      {mounted &&
        lightbox &&
        createPortal(
          <StyledLightbox
            data-testid="croquis-lightbox"
            onClick={() => setLightbox(null)}
          >
            <StyledLightboxClose
              type="button"
              aria-label="Close"
              data-testid="croquis-lightbox-close"
              onClick={() => setLightbox(null)}
            >
              ×
            </StyledLightboxClose>
            <StyledLightboxFrame>
              <BlurUp
                key={lightbox.photos[lightbox.index]}
                fill
                objectFit="contain"
                placeholder={blurPlaceholderUrl(
                  lightbox.photos[lightbox.index],
                )}
              >
                {(image) => (
                  <img
                    src={cloudinaryTransform(
                      lightbox.photos[lightbox.index],
                      'f_auto,q_auto,w_1600',
                    )}
                    alt=""
                    data-testid="croquis-lightbox-image"
                    // Clicks on the picture keep it open; beside it, close.
                    onClick={(e) => {
                      if (
                        isOnContainedImage(
                          e.currentTarget,
                          e.clientX,
                          e.clientY,
                        )
                      )
                        e.stopPropagation()
                    }}
                    {...image}
                  />
                )}
              </BlurUp>
            </StyledLightboxFrame>
            {lightbox.photos.length > 1 && (
              <StyledLightboxNav>
                <button
                  type="button"
                  aria-label="Previous image"
                  data-testid="croquis-lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    lightboxStep(-1)
                  }}
                >
                  <ChevronIcon />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  data-testid="croquis-lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation()
                    lightboxStep(1)
                  }}
                >
                  <ChevronIcon />
                </button>
              </StyledLightboxNav>
            )}
          </StyledLightbox>,
          document.body,
        )}
    </>
  )
}

'use client'

import { useMemo } from 'react'

import {
  InteractiveCardMap,
  StyledAffects,
  StyledPhenomenon,
  StyledPopoverTitle,
  StyledScaleBody,
  StyledScaleDesc,
  StyledScaleGrade,
  StyledScaleList,
  StyledScaleName,
  StyledScaleRow,
  StyledSource,
} from '@web/components/InteractiveCard'
import {
  CANYON_SCALES,
  FLOW_COLORS,
  FLOW_LEVEL_KEYS,
  STRINGS,
  buildCanyonCard,
} from '@web/lib/cards'
import type { CanyoningCardData, CardZone } from '@web/lib/cards'

export interface CanyonSummaryMapProps {
  data: CanyoningCardData
  /**
   * How a popover opens. `hover` (default) opens on hover and focus; `click`
   * is tap/click-only (no hover), for read contexts like a post.
   */
  interaction?: 'hover' | 'click'
}

/** Grade and flow zones show a full multi-row scale (wider layout). */
function isWide(zone: CardZone): boolean {
  return zone.kind === 'grade' || zone.kind === 'flow'
}

/**
 * The interactive canyon summary: the same card the PNG uses, with an
 * explain-on-click popover over the grade pills, the observed-flow pill and
 * each phenomenon icon.
 */
export function CanyonSummaryMap({
  data,
  interaction = 'hover',
}: CanyonSummaryMapProps) {
  const strings = STRINGS[data.lang]
  const scales = CANYON_SCALES[data.lang]
  const { svg, zones } = useMemo(() => buildCanyonCard(data), [data])

  function zoneLabel(zone: CardZone): string {
    if (zone.kind === 'grade') {
      if (zone.key === 'vert') return scales.ui.verticality
      if (zone.key === 'aqua') return scales.ui.aquatic
      return scales.ui.commitment
    }
    if (zone.kind === 'flow') return scales.ui.flow
    return (strings.phenomena as Record<string, string>)[zone.key]
  }

  function renderGrade(zone: CardZone) {
    const axis = zone.key as 'vert' | 'aqua' | 'commit'
    const title =
      axis === 'vert'
        ? scales.ui.verticality
        : axis === 'aqua'
          ? scales.ui.aquatic
          : scales.ui.commitment
    // Grade zones always carry their token; the fallback is defensive only.
    /* istanbul ignore next */
    const current = (zone.value ?? '').toLowerCase()
    return (
      <>
        <StyledPopoverTitle>{title}</StyledPopoverTitle>
        <StyledScaleList>
          {scales[axis].map((lvl) => (
            <StyledScaleRow
              key={lvl.key}
              $active={lvl.key.toLowerCase() === current}
              data-testid={`canyon-scale-${lvl.key}`}
            >
              <StyledScaleGrade>{lvl.grade}</StyledScaleGrade>
              <StyledScaleBody>
                {lvl.name && <StyledScaleName>{lvl.name}</StyledScaleName>}
                <StyledScaleDesc>{lvl.desc}</StyledScaleDesc>
              </StyledScaleBody>
            </StyledScaleRow>
          ))}
        </StyledScaleList>
        <StyledSource>{scales.ui.source}</StyledSource>
      </>
    )
  }

  function renderFlow() {
    const levels = strings.flow_levels as Record<string, string>
    const rappels = strings.flow_rappels as Record<string, string>
    const affects = data.flowRappels ? rappels[data.flowRappels] : ''
    return (
      <>
        <StyledPopoverTitle>{scales.ui.flow}</StyledPopoverTitle>
        <StyledScaleList>
          {FLOW_LEVEL_KEYS.map((k) => (
            <StyledScaleRow
              key={k}
              $active={k === data.flowLevel}
              data-testid={`canyon-flow-${k}`}
            >
              <StyledScaleGrade>
                <span className="dot" style={{ background: FLOW_COLORS[k] }} />
              </StyledScaleGrade>
              <StyledScaleBody>
                <StyledScaleName>{levels[k]}</StyledScaleName>
              </StyledScaleBody>
            </StyledScaleRow>
          ))}
        </StyledScaleList>
        {affects && (
          <StyledAffects>
            <strong>{scales.ui.affectsRappels}:</strong> {affects}
          </StyledAffects>
        )}
      </>
    )
  }

  function renderPhenomenon(zone: CardZone) {
    const label = (strings.phenomena as Record<string, string>)[zone.key]
    const desc = scales.phenomenaDesc[zone.key]
    return (
      <StyledPhenomenon>
        <span className="label">{label}</span>
        <span className="desc">{desc}</span>
      </StyledPhenomenon>
    )
  }

  function renderPopover(zone: CardZone) {
    if (zone.kind === 'grade') return renderGrade(zone)
    if (zone.kind === 'flow') return renderFlow()
    return renderPhenomenon(zone)
  }

  return (
    <InteractiveCardMap
      svg={svg}
      zones={zones}
      interaction={interaction}
      isWide={isWide}
      zoneLabel={zoneLabel}
      renderPopover={renderPopover}
      hint={zones.length > 0 ? scales.ui.hint : undefined}
    />
  )
}

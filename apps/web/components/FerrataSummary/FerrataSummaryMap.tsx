'use client'

import { useMemo } from 'react'

import {
  InteractiveCardMap,
  StyledPopoverTitle,
  StyledScaleBody,
  StyledScaleDesc,
  StyledScaleGrade,
  StyledScaleList,
  StyledScaleName,
  StyledScaleRow,
  StyledSource,
} from '@web/components/InteractiveCard'
import { FERRATA_SCALES, buildSummaryCard } from '@web/lib/cards'
import type { CardZone, SummaryFerrataData } from '@web/lib/cards'

export interface FerrataSummaryMapProps {
  data: SummaryFerrataData
  /**
   * How a popover opens. `hover` (default) opens on hover and focus; `click`
   * is tap/click-only (no hover), for read contexts like a post.
   */
  interaction?: 'hover' | 'click'
}

/**
 * The interactive via-ferrata summary: the same card the PNG uses, with an
 * explain-on-click popover over the difficulty hero showing the K-scale.
 */
export function FerrataSummaryMap({
  data,
  interaction = 'hover',
}: FerrataSummaryMapProps) {
  const scale = FERRATA_SCALES[data.lang]
  const { svg, zones } = useMemo(() => buildSummaryCard(data), [data])

  function renderPopover() {
    return (
      <>
        <StyledPopoverTitle>{scale.ui.difficulty}</StyledPopoverTitle>
        <StyledScaleList>
          {scale.levels.map((lvl) => (
            <StyledScaleRow
              key={lvl.key}
              $active={lvl.key === data.grade}
              data-testid={`ferrata-scale-${lvl.key}`}
            >
              <StyledScaleGrade>{lvl.grade}</StyledScaleGrade>
              <StyledScaleBody>
                <StyledScaleName>{lvl.name}</StyledScaleName>
                <StyledScaleDesc>{lvl.desc}</StyledScaleDesc>
              </StyledScaleBody>
            </StyledScaleRow>
          ))}
        </StyledScaleList>
        <StyledSource>{scale.ui.source}</StyledSource>
      </>
    )
  }

  return (
    <InteractiveCardMap
      svg={svg}
      zones={zones}
      interaction={interaction}
      isWide={() => true}
      zoneLabel={(_zone: CardZone) => scale.ui.difficulty}
      renderPopover={renderPopover}
      hint={scale.ui.hint}
    />
  )
}

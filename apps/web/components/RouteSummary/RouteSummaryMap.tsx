'use client'

import { useMemo } from 'react'

import { InteractiveCardMap } from '@web/components/InteractiveCard'
import { STRINGS, buildSummaryCard } from '@web/lib/cards'
import type { SummaryRouteData } from '@web/lib/cards'

export interface RouteSummaryMapProps {
  data: SummaryRouteData
}

/**
 * The interactive route summary: the same card the PNG uses, with the
 * altitude read off its elevation profile on hover or tap.
 */
export function RouteSummaryMap({ data }: RouteSummaryMapProps) {
  const { svg, zones, profile } = useMemo(() => buildSummaryCard(data), [data])

  return (
    <InteractiveCardMap
      svg={svg}
      zones={zones}
      interaction="click"
      profile={profile}
      lang={data.lang}
      hint={profile ? STRINGS[data.lang].profile_hint : undefined}
    />
  )
}

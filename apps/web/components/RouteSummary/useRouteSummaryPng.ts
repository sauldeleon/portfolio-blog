import { useMemo } from 'react'

import { useCardPng } from '@web/components/InteractiveCard'
import { buildSummaryCard } from '@web/lib/cards'
import type { SummaryRouteData } from '@web/lib/cards'

/** Rasterises a route summary to PNG, from the same static card the map draws. */
export function useRouteSummaryPng(data: SummaryRouteData) {
  const card = useMemo(() => buildSummaryCard(data), [data])
  return useCardPng(card)
}

import { useMemo } from 'react'

import { useCardPng } from '@web/components/InteractiveCard'
import { buildSummaryCard } from '@web/lib/cards'
import type { SummaryFerrataData } from '@web/lib/cards'

/** Rasterises a ferrata summary to PNG, from the same static card the map draws. */
export function useFerrataSummaryPng(data: SummaryFerrataData) {
  const card = useMemo(() => buildSummaryCard(data), [data])
  return useCardPng(card)
}

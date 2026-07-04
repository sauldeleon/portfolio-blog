import { useMemo } from 'react'

import { useCardPng } from '@web/components/InteractiveCard'
import { buildCanyonCard } from '@web/lib/cards'
import type { CanyoningCardData } from '@web/lib/cards'

/** Rasterises a canyon summary to PNG, from the same static card the map draws. */
export function useCanyonSummaryPng(data: CanyoningCardData) {
  const card = useMemo(() => buildCanyonCard(data), [data])
  return useCardPng(card)
}

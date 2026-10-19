import { buildCanyonCard } from './canyoningCard'
import { buildSummaryCard } from './summaryCard'
import type { CardResult, CardSpec } from './types'

/** Build a CardSpec's card: its SVG and size (some cards grow taller). */
export function buildCard(spec: CardSpec): CardResult {
  switch (spec.kind) {
    case 'canyoning-data':
      return buildCanyonCard(spec)
    case 'summary-route':
    case 'summary-ferrata':
      return buildSummaryCard(spec)
  }
}

/** Dispatch a CardSpec to the appropriate SVG generator. */
export function renderCard(spec: CardSpec): string {
  return buildCard(spec).svg
}

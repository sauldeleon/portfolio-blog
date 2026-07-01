import { canyoningCard } from './canyoningCard'
import { summaryCard } from './summaryCard'
import type { CardSpec } from './types'

/** Dispatch a CardSpec to the appropriate SVG generator. */
export function renderCard(spec: CardSpec): string {
  switch (spec.kind) {
    case 'canyoning-data':
      return canyoningCard(spec)
    case 'summary-route':
    case 'summary-ferrata':
      return summaryCard(spec)
  }
}

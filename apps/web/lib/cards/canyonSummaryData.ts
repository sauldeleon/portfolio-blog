import type { CanyoningCardData } from './types'

/** Serialize canyon summary data to a fence body as pretty-printed JSON. */
export function serializeCanyonSummary(data: CanyoningCardData): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Parse a `canyon-summary` fence body back into card data. Returns null for an
 * empty or malformed body; normalises `kind` and coerces `lang` to a valid
 * value so downstream rendering never crashes on hand-edited markdown.
 */
export function parseCanyonSummary(body: string): CanyoningCardData | null {
  const trimmed = body.trim()
  if (!trimmed) return null
  try {
    const parsed = JSON.parse(trimmed) as Partial<CanyoningCardData>
    if (!parsed || parsed.kind !== 'canyoning-data') return null
    return {
      ...parsed,
      kind: 'canyoning-data',
      lang: parsed.lang === 'es' ? 'es' : 'en',
    }
  } catch {
    return null
  }
}

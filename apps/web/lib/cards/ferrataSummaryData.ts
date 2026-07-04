import type { SummaryFerrataData } from './types'

/** Serialize ferrata summary data to a fence body as pretty-printed JSON. */
export function serializeFerrataSummary(data: SummaryFerrataData): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Parse a `ferrata-summary` fence body back into card data. Returns null for an
 * empty or malformed body; normalises `kind` and coerces `lang` to a valid
 * value so downstream rendering never crashes on hand-edited markdown.
 */
export function parseFerrataSummary(body: string): SummaryFerrataData | null {
  const trimmed = body.trim()
  if (!trimmed) return null
  try {
    const parsed = JSON.parse(trimmed) as Partial<SummaryFerrataData>
    if (!parsed || parsed.kind !== 'summary-ferrata') return null
    return {
      ...parsed,
      kind: 'summary-ferrata',
      lang: parsed.lang === 'es' ? 'es' : 'en',
    }
  } catch {
    return null
  }
}

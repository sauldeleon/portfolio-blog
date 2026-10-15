import type { SummaryRouteData } from './types'

/** Serialize route summary data to a fence body as pretty-printed JSON. */
export function serializeRouteSummary(data: SummaryRouteData): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Parse a `route-summary` fence body back into card data. Returns null for an
 * empty or malformed body; normalises `kind` and coerces `lang` to a valid
 * value so downstream rendering never crashes on hand-edited markdown.
 */
export function parseRouteSummary(body: string): SummaryRouteData | null {
  const trimmed = body.trim()
  if (!trimmed) return null
  try {
    const parsed = JSON.parse(trimmed) as Partial<SummaryRouteData>
    if (!parsed || parsed.kind !== 'summary-route') return null
    return {
      ...parsed,
      kind: 'summary-route',
      lang: parsed.lang === 'es' ? 'es' : 'en',
    }
  } catch {
    return null
  }
}

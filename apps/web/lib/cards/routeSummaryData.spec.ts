import { parseRouteSummary, serializeRouteSummary } from './routeSummaryData'
import type { SummaryRouteData } from './types'

const data: SummaryRouteData = {
  kind: 'summary-route',
  lang: 'es',
  title: 'Peña Ubiña',
  dist: '14.2 km',
  dplus: '1.250 m',
}

describe('serializeRouteSummary', () => {
  it('serialises card data to pretty JSON', () => {
    const out = serializeRouteSummary(data)
    expect(out).toContain('"kind": "summary-route"')
    expect(out).toContain('"dist": "14.2 km"')
    expect(out).toContain('\n')
  })
})

describe('parseRouteSummary', () => {
  it('round-trips serialised data', () => {
    expect(parseRouteSummary(serializeRouteSummary(data))).toEqual(data)
  })

  it('returns null for an empty body', () => {
    expect(parseRouteSummary('')).toBeNull()
    expect(parseRouteSummary('   ')).toBeNull()
  })

  it('returns null for malformed JSON', () => {
    expect(parseRouteSummary('{nope')).toBeNull()
  })

  it('returns null when the kind is wrong', () => {
    expect(
      parseRouteSummary(JSON.stringify({ kind: 'canyoning-data' })),
    ).toBeNull()
  })

  it('returns null when the parsed value is not an object', () => {
    expect(parseRouteSummary('null')).toBeNull()
  })

  it('keeps a valid Spanish lang', () => {
    const out = parseRouteSummary(
      JSON.stringify({ kind: 'summary-route', lang: 'es' }),
    )
    expect(out?.lang).toBe('es')
  })

  it('coerces an unknown lang to English', () => {
    const out = parseRouteSummary(
      JSON.stringify({ kind: 'summary-route', lang: 'fr' }),
    )
    expect(out?.lang).toBe('en')
  })
})

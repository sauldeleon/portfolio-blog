import { parseCanyonSummary, serializeCanyonSummary } from './canyonSummaryData'
import type { CanyoningCardData } from './types'

const data: CanyoningCardData = {
  kind: 'canyoning-data',
  lang: 'es',
  title: 'Barranco de Mascún',
  grade: 'v4 a3 III',
  flowLevel: 'normal',
}

describe('serializeCanyonSummary', () => {
  it('serialises card data to pretty JSON', () => {
    const out = serializeCanyonSummary(data)
    expect(out).toContain('"kind": "canyoning-data"')
    expect(out).toContain('"title": "Barranco de Mascún"')
    expect(out).toContain('\n')
  })
})

describe('parseCanyonSummary', () => {
  it('round-trips serialised data', () => {
    expect(parseCanyonSummary(serializeCanyonSummary(data))).toEqual(data)
  })

  it('returns null for an empty body', () => {
    expect(parseCanyonSummary('')).toBeNull()
    expect(parseCanyonSummary('   ')).toBeNull()
  })

  it('returns null for malformed JSON', () => {
    expect(parseCanyonSummary('{not json')).toBeNull()
  })

  it('returns null when the kind is wrong', () => {
    expect(
      parseCanyonSummary(JSON.stringify({ kind: 'summary-route' })),
    ).toBeNull()
  })

  it('returns null when the parsed value is not an object', () => {
    expect(parseCanyonSummary('null')).toBeNull()
    expect(parseCanyonSummary('42')).toBeNull()
  })

  it('keeps a valid Spanish lang', () => {
    const out = parseCanyonSummary(
      JSON.stringify({ kind: 'canyoning-data', lang: 'es' }),
    )
    expect(out?.lang).toBe('es')
  })

  it('coerces an unknown lang to English', () => {
    const out = parseCanyonSummary(
      JSON.stringify({ kind: 'canyoning-data', lang: 'fr' }),
    )
    expect(out?.lang).toBe('en')
  })

  it('defaults a missing lang to English', () => {
    const out = parseCanyonSummary(JSON.stringify({ kind: 'canyoning-data' }))
    expect(out?.lang).toBe('en')
  })
})

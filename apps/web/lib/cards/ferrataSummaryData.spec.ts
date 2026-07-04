import {
  parseFerrataSummary,
  serializeFerrataSummary,
} from './ferrataSummaryData'
import type { SummaryFerrataData } from './types'

const data: SummaryFerrataData = {
  kind: 'summary-ferrata',
  lang: 'es',
  title: 'Ferrata de Foradada',
  grade: 'K3',
  cable: '800 m',
}

describe('serializeFerrataSummary', () => {
  it('serialises card data to pretty JSON', () => {
    const out = serializeFerrataSummary(data)
    expect(out).toContain('"kind": "summary-ferrata"')
    expect(out).toContain('"grade": "K3"')
    expect(out).toContain('\n')
  })
})

describe('parseFerrataSummary', () => {
  it('round-trips serialised data', () => {
    expect(parseFerrataSummary(serializeFerrataSummary(data))).toEqual(data)
  })

  it('returns null for an empty body', () => {
    expect(parseFerrataSummary('')).toBeNull()
    expect(parseFerrataSummary('   ')).toBeNull()
  })

  it('returns null for malformed JSON', () => {
    expect(parseFerrataSummary('{nope')).toBeNull()
  })

  it('returns null when the kind is wrong', () => {
    expect(
      parseFerrataSummary(JSON.stringify({ kind: 'canyoning-data' })),
    ).toBeNull()
  })

  it('returns null when the parsed value is not an object', () => {
    expect(parseFerrataSummary('null')).toBeNull()
  })

  it('keeps a valid Spanish lang', () => {
    const out = parseFerrataSummary(
      JSON.stringify({ kind: 'summary-ferrata', lang: 'es' }),
    )
    expect(out?.lang).toBe('es')
  })

  it('coerces an unknown lang to English', () => {
    const out = parseFerrataSummary(
      JSON.stringify({ kind: 'summary-ferrata', lang: 'fr' }),
    )
    expect(out?.lang).toBe('en')
  })
})

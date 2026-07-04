import { CANYON_SCALES } from './canyonScales'
import { FLOW_RAPPEL_KEYS, PHENOMENA_KEYS } from './theme'

describe('CANYON_SCALES', () => {
  it.each(['es', 'en'] as const)('has complete %s scales', (lang) => {
    const s = CANYON_SCALES[lang]
    expect(s.vert).toHaveLength(7)
    expect(s.aqua).toHaveLength(7)
    expect(s.commit).toHaveLength(6)
    // every level has a key, grade and description
    for (const level of [...s.vert, ...s.aqua, ...s.commit]) {
      expect(level.key).toBeTruthy()
      expect(level.grade).toBeTruthy()
      expect(level.desc).toBeTruthy()
    }
  })

  it('keys the vertical/aquatic scales by v1-v7 / a1-a7', () => {
    expect(CANYON_SCALES.en.vert.map((l) => l.key)).toEqual([
      'v1',
      'v2',
      'v3',
      'v4',
      'v5',
      'v6',
      'v7',
    ])
    expect(CANYON_SCALES.en.aqua.map((l) => l.key)).toEqual([
      'a1',
      'a2',
      'a3',
      'a4',
      'a5',
      'a6',
      'a7',
    ])
  })

  it('keys the commitment scale by roman numerals I-VI', () => {
    expect(CANYON_SCALES.es.commit.map((l) => l.key)).toEqual([
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
    ])
  })

  it('describes every phenomenon key', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const key of PHENOMENA_KEYS) {
        expect(CANYON_SCALES[lang].phenomenaDesc[key]).toBeTruthy()
      }
    }
  })

  it('exposes localized UI labels', () => {
    expect(CANYON_SCALES.es.ui.verticality).toBe('Escala de verticalidad')
    expect(CANYON_SCALES.en.ui.commitment).toBe('Commitment scale')
  })

  // Guards the flow-rappels keys the popover reads exist in the strings.
  it('recognises the flow-rappel keys', () => {
    expect(FLOW_RAPPEL_KEYS).toContain('committed')
  })
})

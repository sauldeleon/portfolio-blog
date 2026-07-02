import type { CanyonWaypoint } from './canyonWaypoints'
import { isDrawableWaypoint, toCroquisObstacles } from './croquisData'

function wp(overrides: Partial<CanyonWaypoint>): CanyonWaypoint {
  return { categories: ['salto'], title: 'Jump', notes: [], ...overrides }
}

describe('toCroquisObstacles', () => {
  it('drops waypoints that are not jump / rappel / slide', () => {
    const out = toCroquisObstacles([
      wp({ categories: ['info'], title: 'View' }),
      wp({ categories: ['poza'], title: 'Pool' }),
      wp({ categories: ['destrepe'], title: 'Downclimb' }),
      wp({ categories: ['salto'], title: 'Jump' }),
    ])
    expect(out).toHaveLength(1)
    expect(out[0].title).toBe('Jump')
  })

  it('resolves each single category to its glyph type', () => {
    const out = toCroquisObstacles([
      wp({ categories: ['rappel'], title: 'R' }),
      wp({ categories: ['salto'], title: 'S' }),
      wp({ categories: ['tobogan'], title: 'T' }),
    ])
    expect(out.map((o) => o.type)).toEqual(['rapel', 'salto', 'tobogan'])
  })

  it('combines rappel + jump into a split gesture', () => {
    const out = toCroquisObstacles([
      wp({ categories: ['rappel', 'salto'], title: 'R/S' }),
    ])
    expect(out[0].type).toBe('salto-rapel')
  })

  it('prefers the slide when tobogan and jump are combined', () => {
    const out = toCroquisObstacles([
      wp({ categories: ['tobogan', 'salto'], title: 'T/S' }),
    ])
    expect(out[0].type).toBe('tobogan')
  })

  it('reads the drop height from an explicit override', () => {
    const out = toCroquisObstacles([wp({ title: 'Jump', meters: '12' })])
    expect(out[0].meters).toBe(12)
  })

  it('parses a comma decimal override', () => {
    const out = toCroquisObstacles([wp({ title: 'Jump', meters: '3,5' })])
    expect(out[0].meters).toBe(3.5)
  })

  it('falls back to metres parsed from the title', () => {
    const out = toCroquisObstacles([
      wp({ title: 'Rappel 10m', categories: ['rappel'] }),
    ])
    expect(out[0].meters).toBe(10)
  })

  it('leaves metres null when neither override nor title has a height', () => {
    const out = toCroquisObstacles([wp({ title: 'Jump' })])
    expect(out[0].meters).toBeNull()
  })

  it('uses the side override when present', () => {
    const out = toCroquisObstacles([wp({ title: 'Jump', side: 'left' })])
    expect(out[0].side).toBe('left')
  })

  it('detects the side from the title otherwise', () => {
    const out = toCroquisObstacles([wp({ title: 'Jump on the derecha' })])
    expect(out[0].side).toBe('right')
  })

  it('leaves side null when nothing indicates one', () => {
    const out = toCroquisObstacles([wp({ title: 'Jump' })])
    expect(out[0].side).toBeNull()
  })

  it('uses the severity override when present', () => {
    const out = toCroquisObstacles([wp({ title: 'Jump', severity: 'danger' })])
    expect(out[0].severity).toBe('danger')
  })

  it('detects severity from the wording otherwise', () => {
    const out = toCroquisObstacles([
      wp({ title: 'Jump', notes: [{ text: 'peligro de rebufo', sub: false }] }),
    ])
    expect(out[0].severity).toBe('danger')
  })

  it('defaults severity to easy for calm wording', () => {
    const out = toCroquisObstacles([wp({ title: 'Jump' })])
    expect(out[0].severity).toBe('easy')
  })

  it('carries the waypoint photos through when present', () => {
    const out = toCroquisObstacles([
      wp({ title: 'Jump', photos: ['https://x/a.jpg', 'https://x/b.jpg'] }),
    ])
    expect(out[0].photos).toEqual(['https://x/a.jpg', 'https://x/b.jpg'])
  })

  it('leaves photos undefined when the waypoint has none', () => {
    const out = toCroquisObstacles([wp({ title: 'Jump' })])
    expect(out[0].photos).toBeUndefined()
  })

  it('carries notes and coordinates through', () => {
    const out = toCroquisObstacles([
      wp({
        title: 'Jump',
        lat: 42.6,
        lon: 0.14,
        notes: [{ text: 'Aim centre', sub: false }],
      }),
    ])
    expect(out[0].lat).toBe(42.6)
    expect(out[0].lon).toBe(0.14)
    expect(out[0].notes).toEqual([{ text: 'Aim centre', sub: false }])
  })
})

describe('isDrawableWaypoint', () => {
  it('is true for jump / rappel / slide and combos', () => {
    expect(isDrawableWaypoint(['salto'])).toBe(true)
    expect(isDrawableWaypoint(['rappel'])).toBe(true)
    expect(isDrawableWaypoint(['tobogan'])).toBe(true)
    expect(isDrawableWaypoint(['rappel', 'salto'])).toBe(true)
  })

  it('is false for other categories', () => {
    expect(isDrawableWaypoint(['info'])).toBe(false)
    expect(isDrawableWaypoint(['destrepe'])).toBe(false)
    expect(isDrawableWaypoint([])).toBe(false)
  })
})

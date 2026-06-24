import {
  categoryIcon,
  norm,
  parseWaypoints,
  resolveCategory,
  translateName,
  waypointSlug,
} from './waypoints'

function gpxWpt(attrs: string, inner: string): string {
  return `<gpx><wpt ${attrs}>${inner}</wpt></gpx>`
}

describe('norm', () => {
  it('strips diacritics and lowercases', () => {
    expect(norm('Rápel Glaciar')).toBe('rapel glaciar')
  })
})

describe('resolveCategory', () => {
  it('matches a name keyword first', () => {
    expect(resolveCategory('Rápel del salto', undefined)).toBe('rappel')
  })

  it('matches encajonamiento and estrechamiento to canyon', () => {
    expect(resolveCategory('Encajonamiento', undefined)).toBe('canyon')
    expect(resolveCategory('Estrechamiento final', undefined)).toBe('canyon')
  })

  it('falls back to the GPX symbol when no name match', () => {
    expect(resolveCategory('Spot 1', 'Waterfall')).toBe('cascada')
  })

  it('defaults to info when nothing matches', () => {
    expect(resolveCategory('Spot 1', 'mystery')).toBe('info')
    expect(resolveCategory(undefined, undefined)).toBe('info')
  })
})

describe('categoryIcon', () => {
  it('maps a category to its icon', () => {
    expect(categoryIcon('salto')).toBe('drops')
    expect(categoryIcon('tobogan')).toBe('slide')
    expect(categoryIcon('poza')).toBe('poza')
    expect(categoryIcon('destrepe')).toBe('downclimb')
  })

  it('falls back to info for unknown categories', () => {
    expect(categoryIcon('zzz')).toBe('info')
  })
})

describe('translateName', () => {
  it('translates known names for en', () => {
    expect(translateName('Cascada', 'en')).toBe('Waterfall')
  })

  it('passes through unknown names for en', () => {
    expect(translateName('Pico Foo', 'en')).toBe('Pico Foo')
  })

  it('never translates for es', () => {
    expect(translateName('Cascada', 'es')).toBe('Cascada')
  })
})

describe('waypointSlug', () => {
  it('builds a filesystem-safe slug', () => {
    expect(waypointSlug('Rápel 3 (final)')).toBe('rapel_3_final')
  })

  it('falls back to wpt for empty/symbol-only names', () => {
    expect(waypointSlug('!!!')).toBe('wpt')
  })
})

describe('parseWaypoints', () => {
  it('parses lat/lon/ele/name and resolves category', () => {
    const wpts = parseWaypoints(
      gpxWpt('lat="42.5" lon="-1.2"', '<ele>1850</ele><name>Refugio X</name>'),
    )
    expect(wpts).toEqual([
      {
        name: 'Refugio X',
        lat: 42.5,
        lon: -1.2,
        ele: 1850,
        category: 'refugio',
      },
    ])
  })

  it('uses the GPX symbol when the name does not match', () => {
    const [w] = parseWaypoints(
      gpxWpt(
        'lat="42.5" lon="-1.2"',
        '<ele>1850</ele><name>Spot</name><sym>Summit</sym>',
      ),
    )
    expect(w.category).toBe('summit')
  })

  it('skips waypoints without an elevation', () => {
    expect(
      parseWaypoints(gpxWpt('lat="42.5" lon="-1.2"', '<name>No ele</name>')),
    ).toEqual([])
  })

  it('skips waypoints with a non-numeric coordinate', () => {
    expect(
      parseWaypoints(gpxWpt('lat="x" lon="-1.2"', '<ele>10</ele>')),
    ).toEqual([])
  })

  it('decodes XML entities in the name', () => {
    const [w] = parseWaypoints(
      gpxWpt('lat="1" lon="2"', '<ele>5</ele><name>A &amp; B</name>'),
    )
    expect(w.name).toBe('A & B')
  })

  it('rounds the elevation and handles a missing name', () => {
    const [w] = parseWaypoints(gpxWpt('lat="1" lon="2"', '<ele>1849.6</ele>'))
    expect(w.ele).toBe(1850)
    expect(w.name).toBe('')
  })
})

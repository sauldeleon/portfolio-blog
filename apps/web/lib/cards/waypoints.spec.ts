import {
  categoryIcon,
  norm,
  parseWaypoints,
  positionHash,
  resolveCategory,
  translateName,
  waypointFilename,
  waypointFilenames,
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
  it('matches the GPX symbol first', () => {
    expect(resolveCategory('Spot 1', 'Waterfall')).toBe('cascada')
  })

  it('lets the GPX symbol win over a matching name', () => {
    // name would resolve to "cascada" but the symbol takes precedence
    expect(resolveCategory('Cascada bonita', 'Summit')).toBe('summit')
  })

  it('falls back to the name when there is no symbol match', () => {
    expect(resolveCategory('Rápel del salto', undefined)).toBe('rappel')
    expect(resolveCategory('Spot 1', 'mystery')).toBe('info')
  })

  it('matches encajonamiento and estrechamiento to canyon', () => {
    expect(resolveCategory('Encajonamiento', undefined)).toBe('canyon')
    expect(resolveCategory('Estrechamiento final', undefined)).toBe('canyon')
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

describe('positionHash', () => {
  it('gives the same 4-character code for the same spot', () => {
    expect(positionHash(43.0236, -5.9583)).toMatch(/^[0-9a-z]{4}$/)
    expect(positionHash(43.0236, -5.9583)).toBe(positionHash(43.0236, -5.9583))
    // Below ~1 m apart it is the same spot.
    expect(positionHash(43.0236, -5.9583)).toBe(
      positionHash(43.023600001, -5.9583),
    )
  })

  it('tells apart nearby spots', () => {
    expect(positionHash(43.0236, -5.9583)).not.toBe(
      positionHash(43.0237, -5.9583),
    )
  })
})

describe('waypointFilename', () => {
  it('adds altitude and position code when known', () => {
    expect(
      waypointFilename('waypoint-x', 'es', {
        name: 'Collado',
        lat: 43.01,
        lon: -5.9,
        ele: 2113.6,
      }),
    ).toBe(`waypoint-x-es-collado-2114m-${positionHash(43.01, -5.9)}`)
  })

  it('leaves out what is missing or not a number', () => {
    expect(waypointFilename('w', 'en', { name: 'Fuente' })).toBe('w-en-fuente')
    expect(
      waypointFilename('w', 'en', {
        name: 'Fuente',
        lat: 1,
        lon: NaN,
        ele: NaN,
      }),
    ).toBe('w-en-fuente')
    expect(
      waypointFilename('w', 'en', { name: 'Fuente', lat: 1, ele: 5 }, '07'),
    ).toBe('w-en-07-fuente-5m')
  })
})

describe('waypointFilenames', () => {
  it('numbers a batch in order, padding to its size', () => {
    expect(
      waypointFilenames('w', 'en', [{ name: 'A' }, { name: 'A' }]),
    ).toEqual(['w-en-01-a', 'w-en-02-a'])
    const many = waypointFilenames(
      'w',
      'en',
      Array.from({ length: 120 }, () => ({ name: 'P' })),
    )
    expect(many[0]).toBe('w-en-001-p')
    expect(many[119]).toBe('w-en-120-p')
  })
})

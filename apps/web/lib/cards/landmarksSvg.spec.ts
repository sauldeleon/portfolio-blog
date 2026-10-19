import {
  type LandmarkOptions,
  formatMetres,
  landmarkSpace,
  landmarksSvg,
  legendRows,
} from './landmarksSvg'
import type { RouteLandmark } from './types'

const profile = {
  elevation: [1000, 1500, 1200, 1600, 1100],
  x0: 0,
  x1: 1000,
  top: 100,
  bottom: 300,
}

const PEAK: RouteLandmark = {
  kind: 'peak',
  index: 1,
  ele: 1500,
  lat: 0,
  lon: 0,
  name: 'Pico',
}
const COL: RouteLandmark = {
  kind: 'col',
  index: 2,
  ele: 1200,
  lat: 0,
  lon: 0,
  name: 'Collado',
}

function opts(over: Partial<LandmarkOptions> = {}): LandmarkOptions {
  return {
    labels: 'names',
    formatAltitude: (m) => formatMetres(m, 'es'),
    ...over,
  }
}

const LEGEND = { x0: 0, x1: 1000, y: 950 }

describe('formatMetres', () => {
  it('groups thousands the way each language does', () => {
    expect(formatMetres(2417.4, 'es')).toBe('2.417 m')
    expect(formatMetres(2417, 'en')).toBe('2,417 m')
    expect(formatMetres(950, 'es')).toBe('950 m')
  })
})

describe('landmarkSpace', () => {
  it('reserves room above the profile for each mode', () => {
    expect(landmarkSpace([], 'names')).toBe(0)
    expect(landmarkSpace([PEAK], 'markers')).toBe(14)
    expect(landmarkSpace([PEAK], 'legend')).toBe(40)
    expect(landmarkSpace([PEAK], 'names')).toBe(78)
    expect(landmarkSpace([PEAK], 'auto')).toBe(78)
  })
})

describe('legendRows', () => {
  it('wraps into a grid as wide as the room allows', () => {
    const many = Array.from({ length: 6 }, (_, i) => ({ ...PEAK, index: i }))
    expect(legendRows([], opts(), 0, 1000)).toBe(0)
    expect(legendRows(many, opts(), 0, 3000)).toBe(1)
    expect(legendRows(many, opts(), 0, 600)).toBe(3)
    expect(legendRows(many, opts(), 0, 10)).toBe(6)
  })
})

describe('landmarksSvg', () => {
  it('draws only markers', () => {
    const svg = landmarksSvg(
      profile,
      [PEAK, COL],
      opts({ labels: 'markers' }),
      LEGEND,
    )
    expect(svg.match(/<path /g)).toHaveLength(2)
    expect(svg).not.toContain('<text')
  })

  it('names summits above and cols below, with the altitude', () => {
    const svg = landmarksSvg(profile, [PEAK, COL], opts(), LEGEND)
    expect(svg).toContain('>Pico</tspan>')
    expect(svg).toContain('>1.500 m</tspan>')
    expect(svg).toContain('>Collado</tspan>')
  })

  it('shows the altitude alone for unnamed spots, and can hide it', () => {
    const unnamed = { ...PEAK, name: undefined, hideAltitude: true }
    expect(landmarksSvg(profile, [unnamed], opts(), LEGEND)).toContain(
      '>1.500 m</tspan>',
    )
    const svg = landmarksSvg(
      profile,
      [{ ...PEAK, hideAltitude: true }],
      opts(),
      LEGEND,
    )
    expect(svg).toContain('>Pico</tspan>')
    expect(svg).not.toContain('1.500 m')
  })

  it('labels a col near the bottom above it', () => {
    const low = { ...COL, index: 0 }
    const svg = landmarksSvg(profile, [low], opts(), LEGEND)
    // Its marker sits on the bottom edge: there is no room under it.
    const [, y] = /<text x="[\d.]+" y="([\d.]+)"/.exec(svg) ?? []
    expect(Number(y)).toBeLessThan(300)
  })

  it('keeps names off the profile line', () => {
    const svg = landmarksSvg(profile, [PEAK], opts(), LEGEND)
    const [, y] = /<text x="[\d.]+" y="([\d.]+)"/.exec(svg) ?? []
    // Above its summit (y = 133), clear of the line.
    expect(Number(y)).toBeLessThan(133 - 12)
  })

  it('moves clashing names out of the way with a leader, or drops them in auto', () => {
    // Far more long names than fit on a narrow profile.
    const narrow = { ...profile, x1: 300 }
    const crowd = Array.from({ length: 30 }, (_, i) => ({
      ...PEAK,
      index: 1,
      name: `Cima muy larga número ${i}`,
    }))
    const names = landmarksSvg(narrow, crowd, opts(), LEGEND)
    expect(names.match(/<text /g)).toHaveLength(30)
    expect(names).toContain('<line')
    const auto = landmarksSvg(narrow, crowd, opts({ labels: 'auto' }), LEGEND)
    expect(auto.match(/<text /g)!.length).toBeLessThan(30)
    expect(auto.match(/<path /g)).toHaveLength(30)
  })

  it('stacks crowded col names downwards with a leader', () => {
    const deep = { ...profile, bottom: 600 }
    const cols = [0, 1, 2].map((i) => ({
      ...COL,
      name: `Collado muy largo número ${i}`,
    }))
    const svg = landmarksSvg(deep, cols, opts(), LEGEND)
    expect(svg.match(/<text /g)).toHaveLength(3)
    expect(svg).toContain('<line')
  })

  it('keeps labels above a floor', () => {
    const low = { ...COL, index: 2 }
    // Under the col would be y=282 at most; the floor keeps it above 250.
    const svg = landmarksSvg(profile, [low], opts({ floor: 250 }), LEGEND)
    const ys = [...svg.matchAll(/<text x="[\d.]+" y="([\d.]+)"/g)].map((m) =>
      Number(m[1]),
    )
    expect(Math.max(...ys)).toBeLessThanOrEqual(250)
  })

  it('draws other waypoints with their category icon', () => {
    const hut: RouteLandmark = {
      kind: 'point',
      category: 'refugio',
      index: 2,
      ele: 1547,
      lat: 0,
      lon: 0,
      name: 'Refugio',
    }
    const svg = landmarksSvg(
      profile,
      [hut, { ...hut, category: undefined }],
      opts(),
      LEGEND,
    )
    expect(svg.match(/<circle /g)).toHaveLength(2)
    expect(svg).toContain('>Refugio</tspan>')
  })

  it('numbers the markers and aligns the legend in columns', () => {
    const five = [
      PEAK,
      COL,
      { ...PEAK, index: 3, name: 'Otro pico más largo' },
      { ...COL, index: 4 },
      PEAK,
    ]
    const svg = landmarksSvg(profile, five, opts({ labels: 'legend' }), {
      x0: 0,
      x1: 900,
      y: 950,
    })
    const xs = [...svg.matchAll(/<circle cx="([\d.]+)" cy="944\.0"/g)].map(
      (m) => m[1],
    )
    const nextRow = [...svg.matchAll(/<circle cx="([\d.]+)" cy="976\.0"/g)].map(
      (m) => m[1],
    )
    // Rows share the same column positions.
    expect(nextRow.length).toBeGreaterThan(0)
    expect(xs.slice(0, nextRow.length)).toEqual(nextRow)
    expect(svg).toContain('text-anchor="start"')
    expect(svg).toContain('>1</text>')
    expect(svg).toContain('>5</text>')
  })
})

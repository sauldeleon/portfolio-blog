import { haversine, project, projectOnSegment, triangleArea } from './geo'

describe('haversine', () => {
  it('returns 0 for the same point', () => {
    expect(haversine({ lat: 42, lon: 0 }, { lat: 42, lon: 0 })).toBe(0)
  })

  it('measures one degree of latitude as ~111 km', () => {
    const d = haversine({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })
    expect(d).toBeGreaterThan(111000)
    expect(d).toBeLessThan(111300)
  })
})

describe('project', () => {
  it('projects to metres around a reference latitude', () => {
    const a = project({ lat: 42, lon: 0 }, 42)
    const b = project({ lat: 42, lon: 0.001 }, 42)
    const dx = b.x - a.x
    expect(dx).toBeCloseTo(
      haversine({ lat: 42, lon: 0 }, { lat: 42, lon: 0.001 }),
      0,
    )
  })
})

describe('projectOnSegment', () => {
  it('returns the perpendicular distance inside the segment', () => {
    const r = projectOnSegment({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })
    expect(r.distSq).toBe(9)
    expect(r.t).toBe(0.5)
  })

  it('clamps to the segment ends', () => {
    expect(
      projectOnSegment({ x: -4, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 }),
    ).toEqual({ distSq: 25, t: 0 })
    expect(
      projectOnSegment({ x: 14, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 }).t,
    ).toBe(1)
  })

  it('handles a zero-length segment', () => {
    expect(
      projectOnSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 }),
    ).toEqual({ distSq: 25, t: 0 })
  })
})

describe('triangleArea', () => {
  it('computes the absolute area', () => {
    expect(triangleArea({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 })).toBe(6)
    expect(triangleArea({ x: 0, y: 0 }, { x: 0, y: 3 }, { x: 4, y: 0 })).toBe(6)
  })
})

import { pt } from './points.mock'
import {
  cumulativeDistances,
  elevationProfile,
  indexAtDistance,
} from './profile'

describe('cumulativeDistances', () => {
  it('accumulates distance from the start', () => {
    expect(cumulativeDistances([])).toEqual([])
    const d = cumulativeDistances([pt(0), pt(10), pt(30)])
    expect(d[0]).toBe(0)
    expect(d[1]).toBeCloseTo(10, 0)
    expect(d[2]).toBeCloseTo(30, 0)
  })
})

describe('elevationProfile', () => {
  it('skips points without elevation and keeps their indices', () => {
    const profile = elevationProfile([
      pt(0, 0, { ele: 100 }),
      pt(10, 0, { ele: null }),
      pt(20, 0, { ele: 120 }),
    ])
    expect(profile.map((p) => [p.index, p.ele])).toEqual([
      [0, 100],
      [2, 120],
    ])
    expect(profile[1].distance).toBeCloseTo(20, 0)
  })

  it('downsamples long tracks keeping the last sample', () => {
    const points = Array.from({ length: 1001 }, (_, i) => pt(i, 0, { ele: i }))
    const profile = elevationProfile(points, 100)
    expect(profile.length).toBeLessThanOrEqual(101)
    expect(profile[0].index).toBe(0)
    expect(profile[profile.length - 1].index).toBe(1000)
  })
})

describe('indexAtDistance', () => {
  it('returns the closest point', () => {
    const distances = [0, 100, 250, 400]
    expect(indexAtDistance(distances, -50)).toBe(0)
    expect(indexAtDistance(distances, 160)).toBe(1)
    expect(indexAtDistance(distances, 200)).toBe(2)
    expect(indexAtDistance(distances, 9000)).toBe(3)
  })
})

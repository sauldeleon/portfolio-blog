import { pt } from './points.mock'
import { computeStats, sumStats } from './stats'

describe('computeStats', () => {
  it('returns zeros for an empty track', () => {
    expect(computeStats([])).toEqual({
      points: 0,
      distance: 0,
      ascent: 0,
      descent: 0,
      minEle: null,
      maxEle: null,
      duration: null,
    })
  })

  it('computes distance, elevation range and duration', () => {
    const stats = computeStats([
      pt(0, 0, { ele: 100, time: 0 }),
      pt(100, 0, { ele: 110, time: 60000 }),
      pt(200, 0, { ele: null, time: null }),
      pt(300, 0, { ele: 90, time: 120000 }),
    ])
    expect(stats.points).toBe(4)
    expect(stats.distance).toBeCloseTo(300, -1)
    expect(stats.ascent).toBe(10)
    expect(stats.descent).toBe(20)
    expect(stats.minEle).toBe(90)
    expect(stats.maxEle).toBe(110)
    expect(stats.duration).toBe(120)
  })

  it('ignores elevation noise below the threshold', () => {
    const eles = [100, 101, 100, 102, 100, 101, 106]
    const stats = computeStats(eles.map((ele, i) => pt(i, 0, { ele })))
    expect(stats.ascent).toBe(6)
    expect(stats.descent).toBe(0)
    expect(
      computeStats(
        eles.map((ele, i) => pt(i, 0, { ele })),
        0.5,
      ).ascent,
    ).toBe(9)
  })
})

describe('sumStats', () => {
  it('adds up stats', () => {
    const a = computeStats([
      pt(0, 0, { ele: 100, time: 0 }),
      pt(100, 0, { ele: 120, time: 10000 }),
    ])
    const b = computeStats([pt(0, 0, { ele: 50 }), pt(100, 0, { ele: 40 })])
    const total = sumStats([a, b])
    expect(total.points).toBe(4)
    expect(total.ascent).toBe(20)
    expect(total.descent).toBe(10)
    expect(total.minEle).toBe(40)
    expect(total.maxEle).toBe(120)
    expect(total.duration).toBe(10)
  })

  it('returns nulls when nothing has elevation or time', () => {
    const total = sumStats([computeStats([pt(0), pt(1)])])
    expect(total.minEle).toBeNull()
    expect(total.maxEle).toBeNull()
    expect(total.duration).toBeNull()
  })
})

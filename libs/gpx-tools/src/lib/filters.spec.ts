import {
  removeDetourSpikes,
  removeSpeedSpikes,
  removeStops,
  smoothElevation,
  smoothPositions,
  trimEnds,
} from './filters'
import { pt } from './points.mock'

const t = (s: number) => ({ time: s * 1000 })

describe('removeSpeedSpikes', () => {
  it('returns a copy for short tracks or a non-positive speed', () => {
    const points = [pt(0)]
    expect(removeSpeedSpikes(points, 10)).toEqual(points)
    const two = [pt(0, 0, t(0)), pt(1000, 0, t(1))]
    expect(removeSpeedSpikes(two, 0)).toEqual(two)
  })

  it('drops points reached too fast from the last kept point', () => {
    const points = [
      pt(0, 0, t(0)),
      pt(5, 0, t(5)),
      pt(500, 0, t(6)),
      pt(10, 0, t(10)),
    ]
    expect(removeSpeedSpikes(points, 30)).toEqual([
      points[0],
      points[1],
      points[3],
    ])
  })

  it('keeps points without usable timestamps', () => {
    const points = [pt(0), pt(500), pt(0, 0, t(5)), pt(900, 0, t(5))]
    expect(removeSpeedSpikes(points, 30)).toEqual(points)
  })
})

describe('removeDetourSpikes', () => {
  it('returns a copy for short tracks or a non-positive detour', () => {
    const two = [pt(0), pt(1)]
    expect(removeDetourSpikes(two, 10)).toEqual(two)
    const three = [pt(0), pt(1, 100), pt(2)]
    expect(removeDetourSpikes(three, 0)).toEqual(three)
  })

  it('drops out-and-back spikes', () => {
    const points = [pt(0), pt(5), pt(6, 100), pt(7), pt(12)]
    expect(removeDetourSpikes(points, 40)).toEqual([
      points[0],
      points[1],
      points[3],
      points[4],
    ])
  })

  it('keeps long legs when the neighbours are far apart too', () => {
    const points = [pt(0), pt(100), pt(200)]
    expect(removeDetourSpikes(points, 40)).toEqual(points)
  })
})

describe('removeStops', () => {
  it('returns a copy for short tracks or a non-positive radius', () => {
    const two = [pt(0), pt(1)]
    expect(removeStops(two, 5, 0)).toEqual(two)
    const three = [pt(0), pt(1), pt(2)]
    expect(removeStops(three, 0, 0)).toEqual(three)
  })

  it('collapses a long enough stop to its first and last point', () => {
    const points = [
      pt(-50, 0, t(0)),
      pt(0, 0, t(10)),
      pt(1, 0, t(100)),
      pt(2, 0, t(200)),
      pt(1, 1, t(300)),
      pt(50, 0, t(310)),
    ]
    expect(removeStops(points, 5, 120)).toEqual([
      points[0],
      points[1],
      points[4],
      points[5],
    ])
  })

  it('keeps short stops', () => {
    const points = [
      pt(0, 0, t(0)),
      pt(1, 0, t(10)),
      pt(2, 0, t(20)),
      pt(50, 0, t(30)),
    ]
    expect(removeStops(points, 5, 120)).toEqual(points)
  })

  it('treats clusters without timestamps as stops', () => {
    const points = [pt(0), pt(1), pt(2), pt(50)]
    expect(removeStops(points, 5, 120)).toEqual([
      points[0],
      points[2],
      points[3],
    ])
  })
})

describe('smoothPositions', () => {
  it('returns a copy for short tracks or a small window', () => {
    const two = [pt(0), pt(1)]
    expect(smoothPositions(two, 3)).toEqual(two)
    const three = [pt(0), pt(1, 10), pt(2)]
    expect(smoothPositions(three, 1)).toEqual(three)
  })

  it('averages inner points and keeps the endpoints', () => {
    const points = [pt(0), pt(10, 9), pt(20), pt(30)]
    const result = smoothPositions(points, 3)
    expect(result[0]).toEqual(points[0])
    expect(result[3]).toEqual(points[3])
    expect(result[1].lon).toBeCloseTo(points[1].lon / 3, 10)
    expect(result[1].lat).toBeCloseTo(points[1].lat, 10)
  })
})

describe('smoothElevation', () => {
  it('returns a copy for short tracks or a small window', () => {
    const two = [pt(0), pt(1)]
    expect(smoothElevation(two, 3)).toEqual(two)
    const three = [pt(0), pt(1), pt(2)]
    expect(smoothElevation(three, 0)).toEqual(three)
  })

  it('averages elevation, skipping points without one', () => {
    const points = [
      pt(0, 0, { ele: 100 }),
      pt(1, 0, { ele: 130 }),
      pt(2, 0, { ele: null }),
      pt(3, 0, { ele: 100 }),
      pt(4, 0, { ele: 100 }),
    ]
    const result = smoothElevation(points, 3)
    expect(result.map((p) => p.ele)).toEqual([100, 115, null, 100, 100])
  })
})

describe('trimEnds', () => {
  it('returns a copy for very short tracks', () => {
    const one = [pt(0)]
    expect(trimEnds(one, 10, 10)).toEqual(one)
  })

  it('removes points around the start and end', () => {
    const points = [pt(0), pt(5), pt(20), pt(40), pt(55), pt(60)]
    expect(trimEnds(points, 10, 10)).toEqual([points[2], points[3]])
  })

  it('skips a radius of zero', () => {
    const points = [pt(0), pt(5), pt(20), pt(25)]
    expect(trimEnds(points, 0, 10)).toEqual([points[0], points[1]])
    expect(trimEnds(points, 10, 0)).toEqual([points[2], points[3]])
  })

  it('leaves the track untouched when too little would survive', () => {
    const points = [pt(0), pt(5), pt(10)]
    expect(trimEnds(points, 100, 100)).toEqual(points)
  })
})

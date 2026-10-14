import {
  deletePoints,
  elevationAt,
  insertPoint,
  moveItem,
  movePoint,
  nearestPointIndex,
  nearestSegment,
} from './edit'
import { pt } from './points.mock'

describe('nearestPointIndex', () => {
  it('returns -1 for an empty list', () => {
    expect(nearestPointIndex([], pt(0))).toBe(-1)
  })

  it('finds the closest point', () => {
    expect(nearestPointIndex([pt(0), pt(10), pt(20)], pt(12))).toBe(1)
  })
})

describe('nearestSegment', () => {
  it('returns null with fewer than two points', () => {
    expect(nearestSegment([pt(0)], pt(0))).toBeNull()
  })

  it('finds the closest segment and the position along it', () => {
    const result = nearestSegment([pt(0), pt(10), pt(20, 20)], pt(5, 1))
    expect(result?.index).toBe(0)
    expect(result?.t).toBeCloseTo(0.5, 1)
    expect(result?.distance).toBeCloseTo(1, 0)
  })
})

describe('movePoint', () => {
  it('moves only the given point', () => {
    const points = [pt(0), pt(10)]
    const result = movePoint(points, 1, { lat: 1, lon: 2 })
    expect(result[0]).toBe(points[0])
    expect(result[1]).toEqual({ ...points[1], lat: 1, lon: 2 })
  })
})

describe('deletePoints', () => {
  const points = [pt(0), pt(1), pt(2), pt(3)]

  it('deletes a single point', () => {
    expect(deletePoints(points, 1)).toEqual([pt(0), pt(2), pt(3)])
  })

  it('deletes an inclusive range in any order', () => {
    expect(deletePoints(points, 2, 1)).toEqual([pt(0), pt(3)])
  })
})

describe('insertPoint', () => {
  it('appends to tracks with fewer than two points', () => {
    expect(insertPoint([], pt(5))).toEqual([pt(5)])
  })

  it('inserts on the closest segment, interpolating ele and time', () => {
    const points = [
      pt(0, 0, { ele: 100, time: 0 }),
      pt(10, 0, { ele: 200, time: 10000 }),
      pt(20, 0, { ele: null, time: null }),
    ]
    const result = insertPoint(points, pt(5, 1))
    expect(result).toHaveLength(4)
    expect(result[1].ele).toBeCloseTo(150, -1)
    expect(result[1].time).toBeGreaterThan(4000)
    expect(result[1].time).toBeLessThan(6000)
    const later = insertPoint(points, pt(15, 1))
    expect(later[2].ele).toBeNull()
    expect(later[2].time).toBeNull()
  })
})

describe('elevationAt', () => {
  it('returns the elevation of the nearest point', () => {
    expect(
      elevationAt([pt(0, 0, { ele: 5 }), pt(10, 0, { ele: 9 })], pt(8)),
    ).toBe(9)
    expect(elevationAt([], pt(0))).toBeNull()
  })
})

describe('moveItem', () => {
  it('moves an element forwards and backwards', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('returns the same list for no-op or out-of-range moves', () => {
    const items = ['a', 'b']
    expect(moveItem(items, 1, 1)).toBe(items)
    expect(moveItem(items, 0, -1)).toBe(items)
    expect(moveItem(items, 1, 2)).toBe(items)
  })
})

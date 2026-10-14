import { pt } from './points.mock'
import { douglasPeucker, radialDistance, visvalingam } from './simplify'

describe('radialDistance', () => {
  it('returns a copy for short tracks or a non-positive distance', () => {
    const points = [pt(0), pt(1)]
    expect(radialDistance(points, 5)).toEqual(points)
    expect(radialDistance(points, 5)).not.toBe(points)
    const three = [pt(0), pt(1), pt(2)]
    expect(radialDistance(three, 0)).toEqual(three)
  })

  it('drops points closer than the distance to the last kept point', () => {
    const points = [pt(0), pt(1), pt(2), pt(6), pt(7), pt(8)]
    expect(radialDistance(points, 5)).toEqual([pt(0), pt(6), pt(8)])
  })
})

describe('douglasPeucker', () => {
  it('returns a copy for short tracks or a non-positive tolerance', () => {
    const points = [pt(0), pt(1)]
    expect(douglasPeucker(points, 5)).toEqual(points)
    const three = [pt(0), pt(1, 10), pt(2)]
    expect(douglasPeucker(three, 0)).toEqual(three)
  })

  it('removes collinear points', () => {
    const points = [pt(0), pt(10), pt(20), pt(30)]
    expect(douglasPeucker(points, 1)).toEqual([pt(0), pt(30)])
  })

  it('drops noise within the tolerance', () => {
    const points = [pt(0), pt(10, 0.5), pt(20), pt(30, 0.5), pt(40)]
    expect(douglasPeucker(points, 2)).toEqual([pt(0), pt(40)])
  })

  it('keeps points that deviate more than the tolerance', () => {
    const points = [pt(0), pt(10, 0.5), pt(20, 20), pt(30, 0.5), pt(40)]
    const result = douglasPeucker(points, 2)
    expect(result).toContainEqual(pt(20, 20))
    expect(douglasPeucker(points, 30)).toEqual([pt(0), pt(40)])
  })
})

describe('visvalingam', () => {
  it('returns a copy for short tracks or a non-positive area', () => {
    const points = [pt(0), pt(1)]
    expect(visvalingam(points, 5)).toEqual(points)
    const three = [pt(0), pt(1, 10), pt(2)]
    expect(visvalingam(three, 0)).toEqual(three)
  })

  it('removes small triangles and keeps big ones', () => {
    const points = [
      pt(0),
      pt(1, 0.1),
      pt(2),
      pt(3, 0.1),
      pt(4),
      pt(10, 30),
      pt(16),
      pt(17, 0.1),
      pt(18),
    ]
    const result = visvalingam(points, 20)
    expect(result).toContainEqual(pt(10, 30))
    expect(result).not.toContainEqual(pt(1, 0.1))
    expect(result).not.toContainEqual(pt(3, 0.1))
    expect(result).not.toContainEqual(pt(17, 0.1))
  })

  it('removes every collinear point', () => {
    const points = [pt(0), pt(10), pt(20), pt(30)]
    expect(visvalingam(points, 1)).toEqual([pt(0), pt(30)])
  })

  it('keeps everything when all triangles are above the threshold', () => {
    const points = [pt(0), pt(10, 50), pt(20), pt(30, 50), pt(40)]
    expect(visvalingam(points, 10)).toEqual(points)
  })

  it('handles long tracks', () => {
    const points = Array.from({ length: 500 }, (_, i) =>
      pt(i, Math.sin(i / 10) * 20),
    )
    const result = visvalingam(points, 50)
    expect(result.length).toBeLessThan(points.length)
    expect(result[0]).toBe(points[0])
    expect(result[result.length - 1]).toBe(points[499])
  })
})

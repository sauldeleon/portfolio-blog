import {
  type CleanOptions,
  DEFAULT_CLEAN_OPTIONS,
  cleanGpx,
  cleanPoints,
} from './clean'
import { pt } from './points.mock'
import type { GpxFile } from './types'

const ALL_OFF: CleanOptions = {
  trim: { enabled: false, start: 10, end: 10 },
  speedSpikes: { enabled: false, maxSpeedKmh: 30 },
  detourSpikes: { enabled: false, maxDetour: 40 },
  stops: { enabled: false, radius: 5, minDuration: 0 },
  minDistance: { enabled: false, distance: 2 },
  smoothing: { enabled: false, window: 3 },
  simplify: { enabled: false, algorithm: 'douglas-peucker', tolerance: 2 },
  elevationSmoothing: { enabled: false, window: 3 },
}

const ALL_ON: CleanOptions = {
  trim: { enabled: true, start: 1, end: 1 },
  speedSpikes: { enabled: true, maxSpeedKmh: 30 },
  detourSpikes: { enabled: true, maxDetour: 40 },
  stops: { enabled: true, radius: 5, minDuration: 0 },
  minDistance: { enabled: true, distance: 2 },
  smoothing: { enabled: true, window: 3 },
  simplify: { enabled: true, algorithm: 'visvalingam', tolerance: 2 },
  elevationSmoothing: { enabled: true, window: 3 },
}

const track = [
  pt(0, 0, { ele: 100 }),
  pt(10, 0, { ele: 110 }),
  pt(11, 100, { ele: 110 }),
  pt(12, 0, { ele: 120 }),
  pt(20, 3, { ele: 130 }),
  pt(30, 0, { ele: 140 }),
  pt(40, 0, { ele: 150 }),
]

describe('cleanPoints', () => {
  it('returns an equal copy with every filter disabled', () => {
    const result = cleanPoints(track, ALL_OFF)
    expect(result).toEqual(track)
    expect(result).not.toBe(track)
  })

  it('runs every enabled filter', () => {
    const result = cleanPoints(track, ALL_ON)
    expect(result.length).toBeLessThan(track.length)
    expect(result).not.toContainEqual(track[2])
  })

  it('supports Douglas–Peucker', () => {
    const result = cleanPoints(track, {
      ...ALL_OFF,
      simplify: { enabled: true, algorithm: 'douglas-peucker', tolerance: 200 },
    })
    expect(result).toEqual([track[0], track[6]])
  })

  it('exposes sensible defaults', () => {
    expect(cleanPoints(track, DEFAULT_CLEAN_OPTIONS)).not.toContainEqual(
      track[2],
    )
  })
})

describe('cleanGpx', () => {
  it('cleans every segment of every track', () => {
    const file = {
      doc: {} as Document,
      waypoints: [],
      tracks: [{ name: 'a', segments: [{ points: track }, { points: track }] }],
    } as GpxFile
    const result = cleanGpx(file, {
      ...ALL_OFF,
      simplify: { enabled: true, algorithm: 'douglas-peucker', tolerance: 200 },
    })
    expect(result.tracks[0].name).toBe('a')
    expect(result.tracks[0].segments[1].points).toHaveLength(2)
    expect(result.doc).toBe(file.doc)
  })
})

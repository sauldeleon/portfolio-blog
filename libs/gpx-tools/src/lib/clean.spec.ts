import {
  type CleanOptions,
  DEFAULT_CLEAN_OPTIONS,
  cleanGpx,
  cleanPoints,
  cleanSection,
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

describe('cleanSection', () => {
  const line = Array.from({ length: 11 }, (_, i) => pt(i * 10, 0, { ele: i }))
  const simplifyOnly: CleanOptions = {
    ...ALL_OFF,
    simplify: { enabled: true, algorithm: 'douglas-peucker', tolerance: 5 },
  }

  it('cleans only the section and keeps its ends', () => {
    const result = cleanSection(line, { from: 7, to: 2 }, simplifyOnly)
    expect(result.points).toEqual([...line.slice(0, 3), ...line.slice(7)])
    expect(result.points[2]).toBe(line[2])
    expect(result.points[3]).toBe(line[7])
    expect(result.range).toEqual({ from: 2, to: 3 })
  })

  it('clamps the range to the track', () => {
    const result = cleanSection(line, { from: -5, to: 99 }, simplifyOnly)
    expect(result.points).toEqual([line[0], line[10]])
    expect(result.range).toEqual({ from: 0, to: 1 })
  })

  it('leaves sections without interior points untouched', () => {
    const result = cleanSection(line, { from: 3, to: 4 }, simplifyOnly)
    expect(result.points).toEqual(line)
    expect(result.points).not.toBe(line)
    expect(result.range).toEqual({ from: 3, to: 4 })
  })

  it('never trims a section', () => {
    const result = cleanSection(
      line,
      { from: 0, to: 10 },
      { ...ALL_OFF, trim: { enabled: true, start: 50, end: 50 } },
    )
    expect(result.points).toEqual(line)
  })

  it('pins the ends even when a filter drops or rebuilds them', () => {
    const timed = [
      pt(0, 0, { time: 0 }),
      pt(10, 0, { time: 10_000 }),
      pt(20, 0, { time: 20_000 }),
      pt(5000, 0, { time: 21_000 }),
    ]
    const dropped = cleanSection(
      timed,
      { from: 0, to: 3 },
      { ...ALL_OFF, speedSpikes: { enabled: true, maxSpeedKmh: 30 } },
    )
    expect(dropped.points).toEqual(timed)
    expect(dropped.points[3]).toBe(timed[3])

    const smoothed = cleanSection(
      line,
      { from: 0, to: 4 },
      { ...ALL_OFF, smoothing: { enabled: true, window: 3 } },
    )
    expect(smoothed.points[0]).toBe(line[0])
    expect(smoothed.points[4]).toBe(line[4])
    expect(smoothed.points).toHaveLength(line.length)
  })
})

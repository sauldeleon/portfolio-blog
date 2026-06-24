import { parseGpx, parseTrackPoints } from './gpx'

function gpx(inner: string): string {
  return `<gpx><trk><trkseg>${inner}</trkseg></trk></gpx>`
}

const FULL = gpx(
  `<trkpt lat="42.00" lon="0.00"><ele>1000</ele><time>2025-07-15T09:00:00Z</time></trkpt>` +
    `<trkpt lat="42.01" lon="0.00"><ele>1100</ele><time>2025-07-15T10:00:00Z</time></trkpt>` +
    `<trkpt lat="42.02" lon="0.00"><ele>1050</ele><time>2025-07-15T11:00:00Z</time></trkpt>`,
)

describe('parseTrackPoints', () => {
  it('returns [] when there are no track points', () => {
    expect(parseTrackPoints('<gpx></gpx>')).toEqual([])
  })

  it('parses lat/lon/ele/time from a full point', () => {
    const [p] = parseTrackPoints(
      gpx(
        `<trkpt lat="42.5" lon="-1.2"><ele>1234</ele><time>2025-07-15T09:00:00Z</time></trkpt>`,
      ),
    )
    expect(p.lat).toBe(42.5)
    expect(p.lon).toBe(-1.2)
    expect(p.ele).toBe(1234)
    expect(p.time).toBe(Date.parse('2025-07-15T09:00:00Z'))
    expect(p.iso).toBe('2025-07-15T09:00:00Z')
  })

  it('parses a self-closing trkpt without inner data', () => {
    const [p] = parseTrackPoints(gpx(`<trkpt lat="1" lon="2"/>`))
    expect(p).toEqual({ lat: 1, lon: 2 })
  })

  it('skips points with non-numeric lat/lon', () => {
    expect(parseTrackPoints(gpx(`<trkpt lat="x" lon="2"></trkpt>`))).toEqual([])
  })

  it('omits ele when not numeric', () => {
    const [p] = parseTrackPoints(
      gpx(`<trkpt lat="1" lon="2"><ele>abc</ele></trkpt>`),
    )
    expect(p.ele).toBeUndefined()
  })

  it('omits time when not parseable', () => {
    const [p] = parseTrackPoints(
      gpx(`<trkpt lat="1" lon="2"><time>not-a-date</time></trkpt>`),
    )
    expect(p.time).toBeUndefined()
    expect(p.iso).toBeUndefined()
  })
})

describe('parseGpx', () => {
  it('throws when there are no track points', () => {
    expect(() => parseGpx('<gpx></gpx>')).toThrow('No track points found')
  })

  it('computes distance, ascent, descent, times, date and elevation', () => {
    const m = parseGpx(FULL)
    expect(m.distanceKm).toBe('2.2 km')
    expect(m.ascent).toBe('100 m')
    expect(m.descent).toBe('50 m')
    expect(m.date).toBe('15 Jul 2025')
    expect(m.startTime).toBe('09:00')
    expect(m.endTime).toBe('11:00')
    expect(m.totalTime).toBe('2:00')
    expect(m.movingTime).toBe('2:00')
    expect(m.stoppedTime).toBe('0:00')
    expect(m.elevation).toEqual([1000, 1100, 1050])
  })

  it('leaves time fields empty when points have no time', () => {
    const m = parseGpx(
      gpx(
        `<trkpt lat="42.00" lon="0.00"><ele>1000</ele></trkpt>` +
          `<trkpt lat="42.01" lon="0.00"><ele>1100</ele></trkpt>`,
      ),
    )
    expect(m.startTime).toBe('')
    expect(m.endTime).toBe('')
    expect(m.movingTime).toBe('')
    expect(m.stoppedTime).toBe('')
    expect(m.totalTime).toBe('')
    expect(m.date).toBe('')
    expect(m.elevation).toEqual([1000, 1100])
  })

  it('reports zero gain and empty profile when points have no elevation', () => {
    const m = parseGpx(
      gpx(
        `<trkpt lat="42.00" lon="0.00"><time>2025-07-15T09:00:00Z</time></trkpt>` +
          `<trkpt lat="42.01" lon="0.00"><time>2025-07-15T10:00:00Z</time></trkpt>`,
      ),
    )
    expect(m.ascent).toBe('0 m')
    expect(m.descent).toBe('0 m')
    expect(m.elevation).toEqual([])
  })

  it('counts stopped time when there is no movement between fixes', () => {
    const m = parseGpx(
      gpx(
        `<trkpt lat="42.00" lon="0.00"><time>2025-07-15T09:00:00Z</time></trkpt>` +
          `<trkpt lat="42.00" lon="0.00"><time>2025-07-15T09:30:00Z</time></trkpt>`,
      ),
    )
    expect(m.totalTime).toBe('0:30')
    expect(m.movingTime).toBe('0:00')
    expect(m.stoppedTime).toBe('0:30')
    expect(m.distanceKm).toBe('0.0 km')
  })

  it('handles iso strings without date/clock parts', () => {
    const m = parseGpx(
      gpx(
        `<trkpt lat="42.00" lon="0.00"><time>2025</time></trkpt>` +
          `<trkpt lat="42.01" lon="0.00"><time>2025</time></trkpt>`,
      ),
    )
    expect(m.date).toBe('')
    expect(m.startTime).toBe('')
    expect(m.endTime).toBe('')
    expect(m.totalTime).toBe('0:00')
  })

  it('downsamples long elevation series to 80 points', () => {
    const pts = Array.from(
      { length: 100 },
      (_, i) =>
        `<trkpt lat="${(42 + i * 0.001).toFixed(3)}" lon="0.00"><ele>${1000 + i}</ele></trkpt>`,
    ).join('')
    const m = parseGpx(gpx(pts))
    expect(m.elevation).toHaveLength(80)
  })
})

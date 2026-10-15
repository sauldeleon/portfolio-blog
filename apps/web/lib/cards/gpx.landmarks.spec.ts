import { parseGpx, parseNamedWaypoints } from './gpx'

function gpx(inner: string): string {
  return `<gpx><trk><trkseg>${inner}</trkseg></trk></gpx>`
}

describe('parseNamedWaypoints', () => {
  it('reads named waypoints, decoding entities and skipping the rest', () => {
    expect(
      parseNamedWaypoints(
        '<gpx><wpt lat="43" lon="-5.9"><ele>2417</ele><name> Peña &amp; Ubiña </name></wpt>' +
          '<wpt lat="43.1" lon="-5.8"><ele>1</ele></wpt>' +
          '<wpt lat="x" lon="-5.8"><name>Bad</name></wpt>' +
          '<wpt lat="43.2" lon="-5.7"><name>&lt;&gt;&quot;&apos;</name></wpt></gpx>',
      ),
    ).toEqual([
      { lat: 43, lon: -5.9, name: 'Peña & Ubiña' },
      { lat: 43.2, lon: -5.7, name: '<>"\'' },
    ])
  })
})

describe('parseGpx landmarks', () => {
  // A ridge: up to a summit, down to a col, up to a second summit and down.
  const ELES = [1000, 1200, 1400, 1600, 1500, 1350, 1450, 1700, 1500, 1200]
  const lat = (i: number) => (42 + i * 0.001).toFixed(4)
  const track = ELES.map(
    (ele, i) => `<trkpt lat="${lat(i)}" lon="0.0000"><ele>${ele}</ele></trkpt>`,
  ).join('')

  it('finds the summits and the col, in route order', () => {
    const m = parseGpx(gpx(track))
    expect(m.landmarks.map((l) => [l.kind, l.index, l.ele])).toEqual([
      ['peak', 3, 1600],
      ['col', 5, 1350],
      ['peak', 7, 1700],
    ])
    expect(m.landmarks[0]).toMatchObject({ lat: 42.003, lon: 0 })
  })

  it('names them after nearby GPX waypoints only', () => {
    const m = parseGpx(
      `<gpx><wpt lat="42.0076" lon="0"><name>Antecima</name></wpt>` +
        `<wpt lat="42.0071" lon="0"><name>Pico Alto</name></wpt>` +
        `<wpt lat="42.0050" lon="0.01"><name>Too far</name></wpt>` +
        `<trk><trkseg>${track}</trkseg></trk></gpx>`,
    )
    expect(m.landmarks.map((l) => l.name)).toEqual([
      undefined,
      undefined,
      'Pico Alto',
    ])
  })

  it('moves each one to the real extreme hidden between samples', () => {
    // 200 points sampled down to 80: the true top falls between samples.
    const eles = Array.from({ length: 200 }, (_, i) =>
      i === 100 ? 2001 : 1000 + 1000 * Math.sin((i / 199) * Math.PI),
    )
    const m = parseGpx(
      gpx(
        eles
          .map(
            (ele, i) =>
              `<trkpt lat="${(42 + i * 0.0001).toFixed(4)}" lon="0"><ele>${ele}</ele></trkpt>`,
          )
          .join(''),
      ),
    )
    expect(m.elevation).toHaveLength(80)
    expect(m.landmarks).toEqual([
      expect.objectContaining({ kind: 'peak', ele: 2001, lat: 42.01 }),
    ])
  })

  it('has none without elevation', () => {
    expect(
      parseGpx(gpx('<trkpt lat="42" lon="0"/><trkpt lat="42.01" lon="0"/>'))
        .landmarks,
    ).toEqual([])
  })
})

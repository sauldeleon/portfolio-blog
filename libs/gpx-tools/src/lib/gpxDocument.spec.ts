import {
  createWaypointId,
  parseGpxFile,
  renameGpxFile,
  serializeGpxFile,
} from './gpxDocument'

const GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" version="1.1" creator="test">
  <metadata><name>Meta</name></metadata>
  <wpt lat="42.1" lon="-0.1">
    <ele>915.7666</ele>
    <name>Inicio</name>
    <desc>- one
- two</desc>
    <sym>Information</sym>
    <extensions><foo>bar</foo></extensions>
  </wpt>
  <wpt lat="bad" lon="-0.2"><ele>nope</ele></wpt>
  <trk>
    <name>Track</name>
    <trkseg>
      <trkpt lat="42.60453815571964" lon="-0.1247555008158086">
        <ele>917.3</ele>
        <time>2026-06-04T09:14:54.000Z</time>
        <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>120</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions>
      </trkpt>
      <trkpt lat="42.6046" lon="-0.1248"><time>not a date</time></trkpt>
      <extensions><seg>1</seg></extensions>
    </trkseg>
    <trkseg>
      <trkpt lat="42.7" lon="-0.2"><ele>1000</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`

describe('createWaypointId', () => {
  it('generates unique ids', () => {
    expect(createWaypointId()).not.toBe(createWaypointId())
  })
})

describe('parseGpxFile', () => {
  it('parses tracks, segments, points and waypoints', () => {
    const file = parseGpxFile(GPX)
    expect(file.tracks).toHaveLength(1)
    expect(file.tracks[0].name).toBe('Track')
    expect(file.tracks[0].segments).toHaveLength(2)
    const [p1, p2] = file.tracks[0].segments[0].points
    expect(p1).toMatchObject({
      lat: 42.60453815571964,
      lon: -0.1247555008158086,
      ele: 917.3,
      time: Date.parse('2026-06-04T09:14:54.000Z'),
    })
    expect(p1.source?.localName).toBe('trkpt')
    expect(p2).toMatchObject({ ele: null, time: null })
    expect(file.waypoints[0]).toMatchObject({
      lat: 42.1,
      lon: -0.1,
      ele: 915.7666,
      name: 'Inicio',
      desc: '- one\n- two',
      sym: 'Information',
    })
    expect(file.waypoints[1]).toMatchObject({
      lat: 0,
      lon: -0.2,
      ele: null,
      name: '',
      desc: '',
      sym: '',
    })
  })

  it('handles tracks without a name and points without coordinates', () => {
    const file = parseGpxFile(
      '<gpx><wpt lat="1"/><trk><trkseg><trkpt/></trkseg></trk></gpx>',
    )
    expect(file.tracks[0].name).toBe('')
    expect(file.waypoints[0]).toMatchObject({ lat: 1, lon: 0 })
    expect(file.tracks[0].segments[0].points[0]).toMatchObject({
      lat: 0,
      lon: 0,
    })
  })

  it('throws on malformed XML', () => {
    expect(() => parseGpxFile('<gpx><trk>')).toThrow('Invalid GPX file')
  })

  it('throws when the root is not <gpx>', () => {
    expect(() => parseGpxFile('<kml/>')).toThrow('Invalid GPX file')
  })
})

describe('serializeGpxFile', () => {
  it('round-trips without losing data', () => {
    const file = parseGpxFile(GPX)
    const out = serializeGpxFile(file)
    expect(out.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<gpx')).toBe(
      true,
    )
    expect(out).toContain('lat="42.60453815571964"')
    expect(out).toContain('<ele>915.7666</ele>')
    expect(out).toContain('<time>2026-06-04T09:14:54.000Z</time>')
    expect(out).toContain('<gpxtpx:hr>120</gpxtpx:hr>')
    expect(out).toContain('<foo>bar</foo>')
    expect(out).toContain('<seg>1</seg>')
    expect(out).toContain('<metadata>')
    // Waypoints stay before the tracks.
    expect(out.indexOf('<wpt')).toBeLessThan(out.indexOf('<trk>'))
    // The parsed document itself is not mutated.
    expect(file.doc.documentElement.getElementsByTagName('wpt')).toHaveLength(2)

    const reparsed = parseGpxFile(out)
    expect(reparsed.tracks[0].segments[0].points[0].ele).toBe(917.3)
    expect(reparsed.waypoints).toHaveLength(2)
  })

  it('indents the output', () => {
    const out = serializeGpxFile(parseGpxFile(GPX))
    expect(out).toContain('\n  <trk>\n    <name>Track</name>')
  })

  it('writes edited points and waypoints', () => {
    const file = parseGpxFile(GPX)
    const [p1] = file.tracks[0].segments[0].points
    const out = serializeGpxFile({
      ...file,
      waypoints: [
        { ...file.waypoints[0], lat: 43, name: 'Nuevo', desc: '', sym: '' },
        {
          id: 'new',
          lat: 42.5,
          lon: -0.5,
          ele: 1234.56,
          name: 'Fuente',
          desc: 'agua',
          sym: 'Drinking Water',
        },
      ],
      tracks: [
        {
          name: 'Track',
          segments: [
            {
              points: [
                { ...p1, lat: 42.123456789, ele: 950, time: 0 },
                { lat: 42.2, lon: -0.3, ele: null, time: null },
              ],
            },
          ],
        },
      ],
    })
    const reparsed = parseGpxFile(out)
    expect(reparsed.waypoints).toHaveLength(2)
    expect(reparsed.waypoints[0]).toMatchObject({
      lat: 43,
      name: 'Nuevo',
      desc: '',
      sym: '',
    })
    expect(out).toContain('<foo>bar</foo>')
    expect(reparsed.waypoints[1]).toMatchObject({
      lat: 42.5,
      lon: -0.5,
      ele: 1234.6,
      name: 'Fuente',
      desc: 'agua',
      sym: 'Drinking Water',
    })
    // New children follow the schema order.
    expect(out).toMatch(
      /<ele>1234.6<\/ele>\s*<name>Fuente<\/name>\s*<desc>agua<\/desc>\s*<sym>Drinking Water<\/sym>/,
    )
    expect(reparsed.tracks[0].segments).toHaveLength(1)
    const points = reparsed.tracks[0].segments[0].points
    expect(points[0]).toMatchObject({ lat: 42.1234568, ele: 950, time: 0 })
    expect(out).toContain('<time>1970-01-01T00:00:00.000Z</time>')
    expect(points[1]).toMatchObject({ lat: 42.2, ele: null, time: null })
    expect(out).toContain('<gpxtpx:hr>120</gpxtpx:hr>')
  })

  it('adds new segments and strips times on request', () => {
    const file = parseGpxFile(
      '<gpx xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg><trkpt lat="1" lon="1"><time>2026-01-01T00:00:00Z</time></trkpt></trkseg></trk></gpx>',
    )
    const [p] = file.tracks[0].segments[0].points
    const out = serializeGpxFile(
      {
        ...file,
        tracks: [{ name: '', segments: [{ points: [p] }, { points: [p] }] }],
      },
      { stripTimes: true },
    )
    const reparsed = parseGpxFile(out)
    expect(reparsed.tracks[0].segments).toHaveLength(2)
    expect(out).not.toContain('<time>')
  })

  it('appends waypoints to a file without tracks', () => {
    const file = parseGpxFile('<gpx/>')
    const out = serializeGpxFile({
      ...file,
      waypoints: [
        { id: 'x', lat: 1, lon: 2, ele: null, name: 'A', desc: '', sym: '' },
      ],
    })
    expect(out).toContain('<wpt lat="1" lon="2">')
  })
})

describe('renameGpxFile', () => {
  it('renames the track and the metadata', () => {
    const file = parseGpxFile(GPX)
    const out = serializeGpxFile(renameGpxFile(file, 'Ordesa'))
    expect(out).toContain('<metadata>\n    <name>Ordesa</name>')
    expect(out).toContain('<trk>\n    <name>Ordesa</name>')
    // The original document is left untouched.
    expect(serializeGpxFile(file)).toContain('<name>Meta</name>')
  })

  it('numbers several tracks and adds missing names in schema order', () => {
    const file = parseGpxFile(
      '<gpx xmlns="http://www.topografix.com/GPX/1/1"><metadata><desc>d</desc></metadata><trk><trkseg><trkpt lat="1" lon="1"/></trkseg></trk><trk><trkseg><trkpt lat="2" lon="2"/></trkseg></trk></gpx>',
    )
    const out = serializeGpxFile(renameGpxFile(file, 'Día 1'))
    expect(out).toMatch(/<metadata>\s*<name>Día 1<\/name>\s*<desc>d<\/desc>/)
    expect(out).toMatch(/<trk>\s*<name>Día 1 1<\/name>\s*<trkseg>/)
    expect(out).toMatch(/<trk>\s*<name>Día 1 2<\/name>\s*<trkseg>/)
  })

  it('works without metadata', () => {
    const file = parseGpxFile('<gpx><trk><name>a</name></trk></gpx>')
    const renamed = renameGpxFile(file, 'b')
    expect(renamed.tracks[0].name).toBe('b')
    expect(serializeGpxFile(renamed)).not.toContain('<metadata>')
  })
})

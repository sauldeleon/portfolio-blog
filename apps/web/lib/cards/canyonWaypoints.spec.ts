import {
  type CanyonWaypoint,
  parseCanyonWaypointsGpx,
  parseCanyonWaypointsText,
  serializeCanyonWaypoints,
} from './canyonWaypoints'

describe('parseCanyonWaypointsText', () => {
  it('parses a colon-prefixed block with coordinates and notes', () => {
    const [wp] = parseCanyonWaypointsText(
      'salto: Resalte 1m - 42.609185 0.141239\n- Flexionar en recepción',
    )
    expect(wp).toEqual<CanyonWaypoint>({
      categories: ['salto'],
      title: 'Resalte 1m',
      lat: 42.609185,
      lon: 0.141239,
      notes: [{ text: 'Flexionar en recepción', sub: false }],
    })
  })

  it('splits multiple blocks on the --- separator', () => {
    const wps = parseCanyonWaypointsText(
      'salto: A - 42.6 0.1\n---\nrapel: B - 42.7 0.2',
    )
    expect(wps).toHaveLength(2)
    expect(wps[0].title).toBe('A')
    expect(wps[1].categories).toEqual(['rappel'])
  })

  it('ignores empty blocks (leading/trailing separators)', () => {
    const wps = parseCanyonWaypointsText('---\nsalto: A - 42.6 0.1\n---\n   \n')
    expect(wps).toHaveLength(1)
    expect(wps[0].title).toBe('A')
  })

  it('drops blank note lines within a block', () => {
    const [wp] = parseCanyonWaypointsText(
      'salto: A - 42.6 0.1\n- one\n\n   \n- two',
    )
    expect(wp.notes.map((n) => n.text)).toEqual(['one', 'two'])
  })

  it('marks indented notes as nested', () => {
    const [wp] = parseCanyonWaypointsText(
      'rapel: A - 42.6 0.1\n- Se puede saltar:\n - Ojo en la recepción',
    )
    expect(wp.notes).toEqual([
      { text: 'Se puede saltar:', sub: false },
      { text: 'Ojo en la recepción', sub: true },
    ])
  })

  it('handles notes without a bullet marker', () => {
    const [wp] = parseCanyonWaypointsText('salto: A - 42.6 0.1\nFlexionar')
    expect(wp.notes).toEqual([{ text: 'Flexionar', sub: false }])
  })

  it('resolves category from the title when there is no prefix', () => {
    const [wp] = parseCanyonWaypointsText('Rapel 40m - 42.6 0.1')
    expect(wp.categories).toEqual(['rappel'])
    expect(wp.title).toBe('Rapel 40m')
  })

  it('falls back to info for an unrecognised unprefixed title', () => {
    const [wp] = parseCanyonWaypointsText('Resalte 1m - 42.6 0.1')
    expect(wp.categories).toEqual(['info'])
  })

  it('strips diacritics from the prefix (tobogán → tobogan)', () => {
    const [wp] = parseCanyonWaypointsText('tobogán: Tobogán 5m - 42.6 0.1')
    expect(wp.categories).toEqual(['tobogan'])
  })

  it('splits a combined prefix into two categories (salto/rapel)', () => {
    const [wp] = parseCanyonWaypointsText('salto/rapel: A - 42.6 0.1')
    expect(wp.categories).toEqual(['salto', 'rappel'])
  })

  it('dedupes and caps a combined prefix at two categories', () => {
    const [wp] = parseCanyonWaypointsText(
      'rapel/rappel/salto/tobogan: A - 42.6 0.1',
    )
    expect(wp.categories).toEqual(['rappel', 'salto'])
  })

  it('keeps only the recognised part of a partly-unknown combined prefix', () => {
    const [wp] = parseCanyonWaypointsText('salto/foo: A - 42.6 0.1')
    expect(wp.categories).toEqual(['salto'])
  })

  it('recognises a dash-delimited prefix', () => {
    const [wp] = parseCanyonWaypointsText(
      'rapel - Rapel izquierda 10m - 42.6 0.1',
    )
    expect(wp.categories).toEqual(['rappel'])
    expect(wp.title).toBe('Rapel izquierda 10m')
  })

  it('treats an unknown colon prefix as part of the title', () => {
    const [wp] = parseCanyonWaypointsText('foo: bar - 42.6 0.1')
    expect(wp.categories).toEqual(['info'])
    expect(wp.title).toBe('foo: bar')
  })

  it('treats an unknown dash prefix as part of the title', () => {
    const [wp] = parseCanyonWaypointsText('foo - bar - 42.6 0.1')
    expect(wp.title).toBe('foo - bar')
  })

  it('parses negative and comma-decimal coordinates', () => {
    const [wp] = parseCanyonWaypointsText('info: Escape - 42,6056 -0,1296')
    expect(wp.lat).toBeCloseTo(42.6056)
    expect(wp.lon).toBeCloseTo(-0.1296)
  })

  it('leaves coordinates undefined when absent', () => {
    const [wp] = parseCanyonWaypointsText('info: Final')
    expect(wp.lat).toBeUndefined()
    expect(wp.lon).toBeUndefined()
    expect(wp.title).toBe('Final')
  })

  it('parses a manual overrides directive and keeps the notes', () => {
    const [wp] = parseCanyonWaypointsText(
      'rapel: R1 - 42.6 0.1\n! side=left; sev=danger; m=10 m\n- Fuerte corriente',
    )
    expect(wp.side).toBe('left')
    expect(wp.severity).toBe('danger')
    expect(wp.meters).toBe('10 m')
    expect(wp.notes).toEqual([{ text: 'Fuerte corriente', sub: false }])
  })

  it('ignores unknown or malformed directive tokens', () => {
    const [wp] = parseCanyonWaypointsText(
      'rapel: R1 - 42.6 0.1\n! side=up; sev=zzz; foo; m=; x=1',
    )
    expect(wp.side).toBeUndefined()
    expect(wp.severity).toBeUndefined()
    expect(wp.meters).toBeUndefined()
  })

  it('leaves overrides undefined when there is no directive', () => {
    const [wp] = parseCanyonWaypointsText('rapel: R1 - 42.6 0.1')
    expect(wp.side).toBeUndefined()
    expect(wp.severity).toBeUndefined()
    expect(wp.meters).toBeUndefined()
  })
})

describe('parseCanyonWaypointsGpx', () => {
  it('parses a <wpt> with a <desc> block of notes', () => {
    const xml =
      '<wpt lat="42.6" lon="0.1"><name>salto: Salto 6m</name>' +
      '<desc>Pasamanos montado\n- Recuerda quitar el cabo</desc></wpt>'
    const [wp] = parseCanyonWaypointsGpx(xml)
    expect(wp.categories).toEqual(['salto'])
    expect(wp.title).toBe('Salto 6m')
    expect(wp.lat).toBe(42.6)
    expect(wp.notes.map((n) => n.text)).toEqual([
      'Pasamanos montado',
      'Recuerda quitar el cabo',
    ])
  })

  it('falls back to <cmt> when there is no <desc>', () => {
    const [wp] = parseCanyonWaypointsGpx(
      '<wpt lat="42.6" lon="0.1"><name>rapel: R1</name><cmt>Comment note</cmt></wpt>',
    )
    expect(wp.notes).toEqual([{ text: 'Comment note', sub: false }])
  })

  it('parses a combined prefix from the GPX name', () => {
    const [wp] = parseCanyonWaypointsGpx(
      '<wpt lat="42.6" lon="0.1"><name>salto/rapel: Salto o Rapel 11m</name></wpt>',
    )
    expect(wp.categories).toEqual(['salto', 'rappel'])
  })

  it('handles a <wpt> with neither desc nor cmt', () => {
    const [wp] = parseCanyonWaypointsGpx(
      '<wpt lat="42.6" lon="0.1"><name>info: Final</name></wpt>',
    )
    expect(wp.notes).toEqual([])
    expect(wp.title).toBe('Final')
  })

  it('leaves coordinates undefined when attributes are missing', () => {
    const [wp] = parseCanyonWaypointsGpx('<wpt><name>info: X</name></wpt>')
    expect(wp.lat).toBeUndefined()
    expect(wp.lon).toBeUndefined()
  })

  it('handles a <wpt> without a name', () => {
    const [wp] = parseCanyonWaypointsGpx('<wpt lat="42.6" lon="0.1"></wpt>')
    expect(wp.categories).toEqual(['info'])
    expect(wp.title).toBe('')
  })

  it('decodes XML entities in name and desc', () => {
    const [wp] = parseCanyonWaypointsGpx(
      '<wpt lat="42.6" lon="0.1"><name>info: A &amp; B</name><desc>&lt;ojo&gt;</desc></wpt>',
    )
    expect(wp.title).toBe('A & B')
    expect(wp.notes[0].text).toBe('<ojo>')
  })

  it('returns an empty array when there are no waypoints', () => {
    expect(parseCanyonWaypointsGpx('<gpx></gpx>')).toEqual([])
  })

  it('reads a manual overrides directive from the GPX desc', () => {
    const [wp] = parseCanyonWaypointsGpx(
      '<wpt lat="42.6" lon="0.1"><name>rapel: R1</name><desc>! side=right\n- note</desc></wpt>',
    )
    expect(wp.side).toBe('right')
    expect(wp.notes).toEqual([{ text: 'note', sub: false }])
  })
})

describe('serializeCanyonWaypoints', () => {
  it('serialises coordinates, prefix and nested notes', () => {
    const text = serializeCanyonWaypoints([
      {
        categories: ['rappel'],
        title: 'R1',
        lat: 42.6,
        lon: 0.1,
        notes: [
          { text: 'top', sub: false },
          { text: 'nested', sub: true },
        ],
      },
    ])
    expect(text).toBe('rappel: R1 - 42.6 0.1\n- top\n - nested')
  })

  it('joins combined categories with a slash', () => {
    const text = serializeCanyonWaypoints([
      { categories: ['salto', 'rappel'], title: 'A', notes: [] },
    ])
    expect(text).toBe('salto/rappel: A')
  })

  it('emits a directive line for manual overrides', () => {
    const text = serializeCanyonWaypoints([
      {
        categories: ['rappel'],
        title: 'R1',
        lat: 42.6,
        lon: 0.1,
        notes: [{ text: 'x', sub: false }],
        side: 'left',
        severity: 'danger',
        meters: '10 m',
      },
    ])
    expect(text).toBe(
      'rappel: R1 - 42.6 0.1\n! side=left; sev=danger; m=10 m\n- x',
    )
  })

  it('round-trips manual overrides through the text parser', () => {
    const original: CanyonWaypoint[] = [
      {
        categories: ['rappel'],
        title: 'R1',
        lat: 42.6,
        lon: 0.1,
        notes: [{ text: 'x', sub: false }],
        side: 'right',
        severity: 'caution',
        meters: '8 m',
      },
    ]
    expect(
      parseCanyonWaypointsText(serializeCanyonWaypoints(original)),
    ).toEqual(original)
  })

  it('omits coordinates when absent', () => {
    const text = serializeCanyonWaypoints([
      { categories: ['info'], title: 'Final', notes: [] },
    ])
    expect(text).toBe('info: Final')
  })

  it('round-trips through the text parser', () => {
    const original: CanyonWaypoint[] = [
      {
        categories: ['salto', 'rappel'],
        title: 'Salto 2m',
        lat: 42.6092,
        lon: 0.1412,
        notes: [{ text: 'Bend on landing', sub: false }],
      },
      { categories: ['info'], title: 'Final', notes: [] },
    ]
    expect(
      parseCanyonWaypointsText(serializeCanyonWaypoints(original)),
    ).toEqual(original)
  })
})

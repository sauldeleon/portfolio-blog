import { canyonWaypointCard } from './canyonWaypointCard'
import type { CanyonWaypointCardData } from './canyonWaypointCard'

const base: CanyonWaypointCardData = {
  lang: 'en',
  categories: ['salto'],
  title: 'Salto 2m',
  lat: 42.60919,
  lon: 0.14124,
  notes: [],
}

describe('canyonWaypointCard', () => {
  it('returns a valid SVG with 1080 width and a numeric height', () => {
    const { svg, width, height } = canyonWaypointCard(base)
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('</svg>')
    expect(width).toBe(1080)
    expect(height).toBeGreaterThan(0)
    expect(svg).toContain('width="1080"')
    expect(svg).toContain(`height="${height}"`)
  })

  it('embeds the card fonts', () => {
    expect(canyonWaypointCard(base).svg).toContain('@font-face')
  })

  it('shows the category label and title', () => {
    const { svg } = canyonWaypointCard(base)
    expect(svg).toContain('JUMP')
    expect(svg).toContain('Salto 2m')
  })

  it('falls back to the info label for an unknown category', () => {
    expect(canyonWaypointCard({ ...base, categories: ['zzz'] }).svg).toContain(
      'POINT OF INTEREST',
    )
  })

  it('uses Spanish labels for lang=es', () => {
    expect(canyonWaypointCard({ ...base, lang: 'es' }).svg).toContain('SALTO')
  })

  it('renders a split badge and joined label for two categories', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      categories: ['rappel', 'salto'],
      title: 'Salto o Rapel 11m',
    })
    expect(svg).toContain('RAPPEL / JUMP')
    // both category icons present: rappel (anchor triangle) + drops (chevrons)
    expect(svg).toContain('M28 16 L72 16')
    expect(svg).toContain('M28 24 L50 40 L72 24')
    // the split divider line between the two icons
    expect(svg).toContain('x1="100"')
  })

  it('renders the coordinates with a crosshair', () => {
    const { svg } = canyonWaypointCard(base)
    expect(svg).toContain('42.609190, 0.141240')
  })

  it('omits coordinates when the waypoint has none', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      lat: undefined,
      lon: undefined,
    })
    expect(svg).not.toMatch(/\d\.\d{6},/)
  })

  it('omits coordinates when only latitude is present', () => {
    expect(canyonWaypointCard({ ...base, lon: undefined }).svg).not.toMatch(
      /\d\.\d{6},/,
    )
  })

  it('omits coordinates when latitude is not finite', () => {
    expect(canyonWaypointCard({ ...base, lat: NaN, lon: 0.1 }).svg).not.toMatch(
      /\d\.\d{6},/,
    )
  })

  it('renders top-level and nested notes', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      notes: [
        { text: 'Access from ferrata', sub: false },
        { text: 'Strong current', sub: true },
      ],
    })
    expect(svg).toContain('Access from ferrata')
    expect(svg).toContain('Strong current')
  })

  it('wraps a long note onto multiple lines', () => {
    const longNote =
      'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen'
    const { svg } = canyonWaypointCard({
      ...base,
      notes: [{ text: longNote, sub: false }],
    })
    expect(svg).toContain('one two')
    expect(svg).toContain('seventeen')
  })

  it('wraps a long title onto multiple lines', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      title: 'Salto o rápel largo desde la repisa de la izquierda del cauce',
    })
    expect(svg).toContain('Salto o')
  })

  it('grows in height with more notes', () => {
    const few = canyonWaypointCard({
      ...base,
      notes: [{ text: 'a', sub: false }],
    }).height
    const many = canyonWaypointCard({
      ...base,
      notes: Array.from({ length: 8 }, (_, i) => ({
        text: `note ${i}`,
        sub: false,
      })),
    }).height
    expect(many).toBeGreaterThan(few)
  })

  it('uses the minimum height when there is little content', () => {
    const { height } = canyonWaypointCard({
      ...base,
      lat: undefined,
      lon: undefined,
      notes: [],
    })
    expect(height).toBeGreaterThanOrEqual(190)
    expect(height).toBeLessThan(280)
  })

  it('falls back to a dash for an empty title', () => {
    expect(canyonWaypointCard({ ...base, title: '' }).svg).toContain('—')
  })

  it('handles a whitespace-only title without crashing', () => {
    expect(canyonWaypointCard({ ...base, title: '   ' }).svg).toContain('<svg')
  })

  it('escapes special characters in a title', () => {
    expect(canyonWaypointCard({ ...base, title: 'A & B <x>' }).svg).toContain(
      'A &amp; B &lt;x&gt;',
    )
  })

  it('shows a drop-height pill parsed from the title', () => {
    expect(canyonWaypointCard({ ...base, title: 'Rappel 10m' }).svg).toContain(
      '10 m',
    )
  })

  it('parses comma-decimal metres', () => {
    expect(
      canyonWaypointCard({ ...base, title: 'Tobogán 2,5m' }).svg,
    ).toContain('2.5 m')
  })

  it('shows a left-side pill with a left arrow', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      title: 'Rápel izquierda 10m',
    })
    expect(svg).toContain('LEFT')
    expect(svg).toContain('M84 50 L20 50')
  })

  it('shows a right-side pill with a right arrow', () => {
    const { svg } = canyonWaypointCard({ ...base, title: 'Rápel 45m derecha' })
    expect(svg).toContain('RIGHT')
    expect(svg).toContain('M16 50 L80 50')
  })

  it('localises the side label for lang=es', () => {
    expect(
      canyonWaypointCard({
        ...base,
        lang: 'es',
        title: 'Salto por la derecha 2m',
      }).svg,
    ).toContain('DCHA')
  })

  it('lets an explicit meters override the title', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      title: 'Rápel bonito',
      meters: '99 m',
    })
    expect(svg).toContain('99 m')
  })

  it('lets an explicit side override the title', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      title: 'Rápel bonito',
      side: 'right',
    })
    expect(svg).toContain('RIGHT')
    expect(svg).toContain('M16 50 L80 50')
  })

  it('lets an explicit severity override auto-detection', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      title: 'Rápel tranquilo',
      severity: 'danger',
    })
    expect(svg).toContain('DANGER')
    expect(svg).toContain('fill="#DB5A4A"')
  })

  it('shows no side pill when the title has no side, only severity', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      title: 'Sucesión de resaltes',
      lat: undefined,
      lon: undefined,
    })
    expect(svg).not.toContain('LEFT')
    expect(svg).not.toContain('RIGHT')
    expect(svg).toContain('EASY')
  })

  it('marks a waypoint as danger from a note keyword', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      notes: [{ text: 'Fuerte corriente', sub: false }],
    })
    expect(svg).toContain('DANGER')
    expect(svg).toContain('fill="#DB5A4A"')
  })

  it('recolours the accent bar red for danger', () => {
    expect(
      canyonWaypointCard({ ...base, title: 'Destrepe feo, cuidado' }).svg,
    ).toContain(
      '<rect x="8" y="80" width="6" height="80" rx="3" fill="#DB5A4A"/>',
    )
  })

  it('marks a waypoint as caution from a note keyword', () => {
    expect(
      canyonWaypointCard({
        ...base,
        notes: [{ text: 'Cubre poco', sub: false }],
      }).svg,
    ).toContain('CAUTION')
  })

  it('lets danger keywords beat caution keywords', () => {
    expect(
      canyonWaypointCard({
        ...base,
        notes: [{ text: 'Ojo, rebufo peligroso', sub: false }],
      }).svg,
    ).toContain('DANGER')
  })

  it('defaults to an easy green accent bar', () => {
    const { svg } = canyonWaypointCard({
      ...base,
      title: 'Poza tranquila',
      notes: [],
    })
    expect(svg).toContain('EASY')
    expect(svg).toContain(
      '<rect x="8" y="80" width="6" height="80" rx="3" fill="#5FB98A"/>',
    )
  })

  it('localises the severity label for lang=es', () => {
    expect(
      canyonWaypointCard({
        ...base,
        lang: 'es',
        notes: [{ text: 'Fuerte corriente', sub: false }],
      }).svg,
    ).toContain('PELIGRO')
  })
})

import {
  croquisBackground,
  croquisCard,
  croquisConnectors,
  croquisNodeContent,
} from './croquisCard'
import type { CroquisObstacle } from './croquisData'
import { layoutCroquis } from './croquisLayout'
import { STRINGS } from './theme'

function ob(overrides: Partial<CroquisObstacle> = {}): CroquisObstacle {
  return {
    type: 'salto',
    title: 'Jump',
    meters: 5,
    side: null,
    severity: 'easy',
    notes: [],
    ...overrides,
  }
}

const EN = STRINGS.en

describe('croquisBackground', () => {
  it('draws contour polylines sized to the height', () => {
    const s = croquisBackground(600, 480)
    expect((s.match(/<polyline/g) ?? []).length).toBe(Math.ceil(480 / 120))
  })
})

describe('croquisConnectors', () => {
  it('returns nothing for an empty layout', () => {
    expect(croquisConnectors(layoutCroquis([]), EN)).toBe('')
  })

  it('draws the access and exit markers', () => {
    const s = croquisConnectors(layoutCroquis([ob()]), EN)
    expect(s).toContain('ACCESS')
    expect(s).toContain('EXIT')
  })

  it('localises the markers', () => {
    const s = croquisConnectors(layoutCroquis([ob()]), STRINGS.es)
    expect(s).toContain('ACCESO')
    expect(s).toContain('SALIDA')
  })
})

describe('croquisNodeContent', () => {
  it('labels a rappel with its category, not a number', () => {
    const [n] = layoutCroquis([ob({ type: 'rapel', title: 'Cascade' })]).nodes
    const s = croquisNodeContent(n, EN)
    expect(s).toContain('>Rappel<')
    expect(s).not.toContain('>R1<')
  })

  it('labels a combo with both categories', () => {
    const [n] = layoutCroquis([
      ob({ type: 'salto-rapel', title: 'Jump or rappel' }),
    ]).nodes
    expect(croquisNodeContent(n, EN)).toContain('>Jump / Rappel<')
  })

  it('labels other obstacles with the first title word', () => {
    const [n] = layoutCroquis([ob({ title: 'Big jump' })]).nodes
    expect(croquisNodeContent(n, EN)).toContain('>Big<')
  })

  it('falls back to a dash for an empty title', () => {
    const [n] = layoutCroquis([ob({ title: '' })]).nodes
    expect(croquisNodeContent(n, EN)).toContain('>—<')
  })

  it('shows metres and a left-side marker', () => {
    const [n] = layoutCroquis([ob({ meters: 8, side: 'left' })]).nodes
    const s = croquisNodeContent(n, EN)
    expect(s).toContain('8 m')
    expect(s).toContain(`◄ ${EN.side_left}`)
  })

  it('shows a right-side marker', () => {
    const [n] = layoutCroquis([ob({ side: 'right' })]).nodes
    expect(croquisNodeContent(n, EN)).toContain(`${EN.side_right} ►`)
  })

  it('omits the metrics line when there is nothing to show', () => {
    const [n] = layoutCroquis([ob({ meters: null, side: null })]).nodes
    const s = croquisNodeContent(n, EN)
    expect(s).not.toContain(' m<')
  })
})

describe('croquisCard', () => {
  it('returns a valid SVG sized to the layout', () => {
    const { svg, width, height } = croquisCard([ob()], 'en')
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('</svg>')
    expect(svg).toContain(`viewBox="0 0 ${width} ${height}"`)
  })

  it('embeds the card fonts', () => {
    expect(croquisCard([ob()], 'en').svg).toContain('@font-face')
  })

  it('renders one glyph set per obstacle', () => {
    const { svg } = croquisCard([ob({ type: 'rapel' }), ob()], 'en')
    expect(svg).toContain('Rappel')
  })

  it('respects the requested drawing width in serpentine mode', () => {
    const obstacles = Array.from({ length: 10 }, () => ob())
    const { width } = croquisCard(obstacles, 'en', 1200)
    expect(width).toBe(1200)
  })
})

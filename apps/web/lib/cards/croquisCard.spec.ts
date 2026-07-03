import {
  CROQUIS_HEADER_H,
  croquisBackground,
  croquisCard,
  croquisConnectors,
  croquisHeader,
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

  it('labels a slide with its localised category, not the raw title', () => {
    const [n] = layoutCroquis([ob({ type: 'tobogan', title: 'Tobogán' })]).nodes
    expect(croquisNodeContent(n, EN)).toContain('>Slide<')
    expect(croquisNodeContent(n, EN)).not.toContain('Tobogán')
  })

  it('labels a jump with its localised category, ignoring the raw title', () => {
    const [n] = layoutCroquis([ob({ type: 'salto', title: 'Big jump' })]).nodes
    expect(croquisNodeContent(n, EN)).toContain('>Jump<')
    expect(croquisNodeContent(n, EN)).not.toContain('Big')
  })

  it('localises the jump label in Spanish', () => {
    const [n] = layoutCroquis([ob({ type: 'salto', title: 'Big jump' })]).nodes
    expect(croquisNodeContent(n, STRINGS.es)).toContain('>Salto<')
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
    const { width } = croquisCard(obstacles, 'en', { width: 1200 })
    expect(width).toBe(1200)
  })

  it('has no title header by default', () => {
    const base = croquisCard([ob()], 'en')
    const titled = croquisCard([ob()], 'en', { title: 'Barranco X' })
    expect(base.svg).not.toContain('>CROQUIS<')
    expect(titled.height).toBe(base.height + CROQUIS_HEADER_H)
  })

  it('draws the card-style title header when a title is given', () => {
    const { svg } = croquisCard([ob()], 'en', { title: 'Barranco X' })
    expect(svg).toContain('CROQUIS')
    expect(svg).toContain('Barranco X')
    expect(svg).toContain(`translate(0, ${CROQUIS_HEADER_H})`)
  })

  it('ignores a whitespace-only title', () => {
    const base = croquisCard([ob()], 'en')
    const blank = croquisCard([ob()], 'en', { title: '   ' })
    expect(blank.height).toBe(base.height)
  })
})

describe('croquisHeader', () => {
  it('renders the eyebrow and escaped title', () => {
    const s = croquisHeader('A & B')
    expect(s).toContain('CROQUIS')
    expect(s).toContain('A &amp; B')
  })
})

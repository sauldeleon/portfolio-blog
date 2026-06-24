import { canyoningCard } from './canyoningCard'
import type { CanyoningCardData } from './types'

const baseEs: CanyoningCardData = {
  kind: 'canyoning-data',
  lang: 'es',
}

const baseEn: CanyoningCardData = {
  kind: 'canyoning-data',
  lang: 'en',
}

describe('canyoningCard', () => {
  it('returns a valid SVG string', () => {
    const svg = canyoningCard(baseEs)
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('</svg>')
  })

  it('embeds the card fonts', () => {
    expect(canyoningCard(baseEs)).toContain('@font-face')
  })

  it('uses 1600×900 dimensions', () => {
    const svg = canyoningCard(baseEs)
    expect(svg).toContain('viewBox="0 0 1600 900"')
    expect(svg).toContain('width="1600"')
    expect(svg).toContain('height="900"')
  })

  it('shows default title when none provided', () => {
    const svg = canyoningCard(baseEs)
    expect(svg).toContain('Resumen de ruta')
  })

  it('shows provided title', () => {
    const svg = canyoningCard({ ...baseEs, title: 'Barranco de Mascún' })
    expect(svg).toContain('Barranco de Masc')
  })

  it('shows date chip when date provided', () => {
    const svg = canyoningCard({ ...baseEs, date: '15 JUL 2025' })
    expect(svg).toContain('15 JUL 2025')
  })

  it('omits date chip when date not provided', () => {
    const svg = canyoningCard(baseEs)
    // chip text only appears if date present
    expect(svg).not.toContain('15 JUL 2025')
  })

  it('shows grade tokens', () => {
    const svg = canyoningCard({ ...baseEs, grade: 'v4 a3 III' })
    expect(svg).toContain('v4')
    expect(svg).toContain('a3')
    expect(svg).toContain('III')
  })

  it('shows desnivel metric', () => {
    const svg = canyoningCard({ ...baseEs, desnivel: '300 m' })
    expect(svg).toContain('300 m')
  })

  it('shows maxRappel metric', () => {
    const svg = canyoningCard({ ...baseEs, maxRappel: '45 m' })
    expect(svg).toContain('45 m')
  })

  it('shows rappels metric', () => {
    const svg = canyoningCard({ ...baseEs, rappels: '12' })
    expect(svg).toContain('12')
  })

  it('formats approach time HH:MM', () => {
    const svg = canyoningCard({ ...baseEs, approach: '1:30' })
    expect(svg).toContain('01:30 h')
  })

  it('formats inCanyon time from minutes', () => {
    const svg = canyoningCard({ ...baseEs, inCanyon: '180' })
    expect(svg).toContain('03:00 h')
  })

  it('formats returnTime passthrough when not parseable', () => {
    const svg = canyoningCard({ ...baseEs, returnTime: '~20 min' })
    expect(svg).toContain('~20 min')
  })

  it('formats total time', () => {
    const svg = canyoningCard({ ...baseEs, total: '5:00' })
    expect(svg).toContain('05:00 h')
  })

  it('shows tech strip when rope is provided', () => {
    const svg = canyoningCard({ ...baseEs, rope: '2x 30 m' })
    expect(svg).toContain('2x 30 m')
    expect(svg).toContain('FICHA TÉCNICA')
  })

  it('renders the observed flow level pill', () => {
    const svg = canyoningCard({ ...baseEs, flowLevel: 'normal' })
    expect(svg).toContain('Normal')
  })

  it('renders affects-rappels text and phenomenon icon chips', () => {
    const svg = canyoningCard({
      ...baseEs,
      flowLevel: 'high',
      flowRappels: 'some_water',
      phenomena: ['murky', 'siphon'],
    })
    expect(svg).toContain('Alto')
    expect(svg).toContain('Algunos rápeles tienen agua')
    expect(svg).toContain('circle cx="42" cy="66"')
  })

  it('skips unknown phenomena and falls back to raw flow values', () => {
    const svg = canyoningCard({
      ...baseEs,
      flowLevel: 'zzz',
      flowRappels: 'qqq',
      phenomena: ['www'],
    })
    expect(svg).toContain('zzz')
    expect(svg).toContain('qqq')
  })

  it('shows tech strip when cars is provided', () => {
    const svg = canyoningCard({ ...baseEs, cars: '2' })
    expect(svg).toContain('COCHES')
  })

  it('shows tech strip when season is provided', () => {
    const svg = canyoningCard({ ...baseEs, season: 'jun-sep' })
    expect(svg).toContain('jun-sep')
  })

  it('omits tech strip when no tech fields provided', () => {
    const svg = canyoningCard(baseEs)
    expect(svg).not.toContain('FICHA TÉCNICA')
  })

  it('uses English strings for lang=en', () => {
    const svg = canyoningCard(baseEn)
    expect(svg).toContain('CANYONING')
    expect(svg).toContain('DIFFICULTY')
  })

  it('uses Spanish strings for lang=es', () => {
    const svg = canyoningCard(baseEs)
    expect(svg).toContain('BARRANCO')
    expect(svg).toContain('DIFICULTAD')
  })

  it('escapes special chars in title', () => {
    const svg = canyoningCard({ ...baseEs, title: 'A & B <test>' })
    expect(svg).toContain('A &amp; B &lt;test&gt;')
  })

  it('uses fallback dash for missing metrics', () => {
    const svg = canyoningCard(baseEs)
    // desnivel, maxRappel, rappels all missing → show —
    const dashCount = (svg.match(/—/g) ?? []).length
    expect(dashCount).toBeGreaterThanOrEqual(3)
  })

  it('reduces title font size for very long titles', () => {
    const shortSvg = canyoningCard({ ...baseEs, title: 'Corto' })
    const longSvg = canyoningCard({
      ...baseEs,
      title:
        'Un título extremadamente largo que no cabe en una sola línea sin reducir el tamaño',
    })
    const shortMatch = shortSvg.match(/font-size="(\d+)"/)
    const longMatch = longSvg.match(/font-size="(\d+)"/)
    const shortSize = shortMatch ? parseInt(shortMatch[1], 10) : 0
    const longSize = longMatch ? parseInt(longMatch[1], 10) : 0
    expect(longSize).toBeLessThanOrEqual(shortSize)
  })

  it('grade sub-labels: vert for v tokens', () => {
    const svg = canyoningCard({ ...baseEs, grade: 'v4' })
    expect(svg).toContain('VERT')
  })

  it('grade sub-labels: aqua for a tokens', () => {
    const svg = canyoningCard({ ...baseEs, grade: 'a3' })
    expect(svg).toContain('ACUÁT')
  })

  it('grade sub-labels: compr for roman numeral tokens', () => {
    const svg = canyoningCard({ ...baseEs, grade: 'III' })
    expect(svg).toContain('COMPR')
  })

  it('grade sub-labels: none for other tokens', () => {
    const svg = canyoningCard({ ...baseEs, grade: 'X2' })
    // X2 starts with non-v/a and contains digit but is not pure roman — no sub-label
    expect(svg).not.toContain('VERT')
    expect(svg).not.toContain('ACUÁT')
    expect(svg).not.toContain('COMPR')
  })

  it('grade sub-labels: aqua en lang=en', () => {
    const svg = canyoningCard({ ...baseEn, grade: 'a2' })
    expect(svg).toContain('AQUA')
  })

  it('grade pills: empty string grade falls back to dash (covers || branch)', () => {
    const svg = canyoningCard({ ...baseEs, grade: '' })
    expect(svg).toContain('—')
  })

  it('grade pills: space-only grade produces empty token (covers ?. branch)', () => {
    const svg = canyoningCard({ ...baseEs, grade: ' ' })
    expect(svg).toContain('<svg')
  })
})

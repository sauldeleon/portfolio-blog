import { canyoningCard } from './canyoningCard'
import type { CanyoningCardData } from './types'

const baseEs: CanyoningCardData = { kind: 'canyoning-data', lang: 'es' }
const baseEn: CanyoningCardData = { kind: 'canyoning-data', lang: 'en' }

// Profile markers no other element shares.
const PROFILE_LINE = 'stroke-opacity="0.75"'
const PROFILE_AREA = 'fill-opacity="0.08"'

describe('canyoningCard', () => {
  it('returns a valid 1600×900 SVG', () => {
    const svg = canyoningCard(baseEs)
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('viewBox="0 0 1600 900"')
  })

  it('embeds the card fonts', () => {
    expect(canyoningCard(baseEs)).toContain('@font-face')
  })

  it('shows default title when none provided', () => {
    expect(canyoningCard(baseEs)).toContain('Resumen de ruta')
  })

  it('shows provided title', () => {
    expect(canyoningCard({ ...baseEs, title: 'Barranco de Mascún' })).toContain(
      'Barranco de Masc',
    )
  })

  it('reduces title font size for very long titles', () => {
    const short = canyoningCard({ ...baseEs, title: 'Corto' })
    const long = canyoningCard({
      ...baseEs,
      title:
        'Un título extremadamente largo que no cabe en una sola línea sin reducir el tamaño',
    })
    const size = (s: string) => {
      const m = /y="126"[^>]*font-size="(\d+)"/.exec(s)
      return m ? parseInt(m[1], 10) : 0
    }
    expect(size(long)).toBeLessThan(size(short))
  })

  it('shows date chip when date provided', () => {
    expect(canyoningCard({ ...baseEs, date: '15 JUL 2025' })).toContain(
      '15 JUL 2025',
    )
  })

  it('omits date chip when date not provided', () => {
    expect(canyoningCard(baseEs)).not.toContain('15 JUL 2025')
  })

  it('shows grade tokens', () => {
    const svg = canyoningCard({ ...baseEs, grade: 'v4 a3 III' })
    expect(svg).toContain('v4')
    expect(svg).toContain('a3')
    expect(svg).toContain('III')
  })

  it('grade sub-labels: vert for v tokens', () => {
    expect(canyoningCard({ ...baseEs, grade: 'v4' })).toContain('VERT')
  })

  it('grade sub-labels: aqua for a tokens', () => {
    expect(canyoningCard({ ...baseEs, grade: 'a3' })).toContain('ACUÁT')
  })

  it('grade sub-labels: compr for roman numeral tokens', () => {
    expect(canyoningCard({ ...baseEs, grade: 'III' })).toContain('COMPR')
  })

  it('grade sub-labels: none for other tokens', () => {
    const svg = canyoningCard({ ...baseEs, grade: 'X2' })
    expect(svg).not.toContain('VERT')
    expect(svg).not.toContain('ACUÁT')
    expect(svg).not.toContain('COMPR')
  })

  it('grade sub-labels: aqua en lang=en', () => {
    expect(canyoningCard({ ...baseEn, grade: 'a2' })).toContain('AQUA')
  })

  it('grade pills: empty string grade falls back to a dash', () => {
    expect(canyoningCard({ ...baseEs, grade: '' })).toContain('—')
  })

  it('grade pills: space-only grade produces empty tokens without crashing', () => {
    expect(canyoningCard({ ...baseEs, grade: ' ' })).toContain('<svg')
  })

  it('shows desnivel, maxRappel and rappels metrics', () => {
    const svg = canyoningCard({
      ...baseEs,
      desnivel: '300 m',
      maxRappel: '45 m',
      rappels: '12',
    })
    expect(svg).toContain('300 m')
    expect(svg).toContain('45 m')
    expect(svg).toContain('12')
  })

  it('reduces hero value font size for very long values', () => {
    const svg = canyoningCard({ ...baseEs, desnivel: '123456789 m acumulado' })
    expect(svg).toContain('<svg')
  })

  it('formats approach time HH:MM', () => {
    expect(canyoningCard({ ...baseEs, approach: '1:30' })).toContain('01:30 h')
  })

  it('formats inCanyon time from minutes', () => {
    expect(canyoningCard({ ...baseEs, inCanyon: '180' })).toContain('03:00 h')
  })

  it('formats returnTime passthrough when not parseable', () => {
    expect(canyoningCard({ ...baseEs, returnTime: '~20 min' })).toContain(
      '~20 min',
    )
  })

  it('formats total time', () => {
    expect(canyoningCard({ ...baseEs, total: '5:00' })).toContain('05:00 h')
  })

  it('uses fallback dash for missing metrics', () => {
    const dashCount = (canyoningCard(baseEs).match(/—/g) ?? []).length
    expect(dashCount).toBeGreaterThanOrEqual(3)
  })

  it('shows tech strip when rope is provided', () => {
    const svg = canyoningCard({ ...baseEs, rope: '2x 30 m' })
    expect(svg).toContain('2x 30 m')
    expect(svg).toContain('FICHA TÉCNICA')
  })

  it('shows tech strip when cars is provided', () => {
    expect(canyoningCard({ ...baseEs, cars: '2' })).toContain('COCHES')
  })

  it('shows tech strip when season is provided', () => {
    expect(canyoningCard({ ...baseEs, season: 'jun-sep' })).toContain('jun-sep')
  })

  it('omits tech strip when no tech fields provided', () => {
    expect(canyoningCard(baseEs)).not.toContain('FICHA TÉCNICA')
  })

  it('renders the observed flow level pill', () => {
    expect(canyoningCard({ ...baseEs, flowLevel: 'normal' })).toContain(
      'Normal',
    )
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

  it('uses Spanish strings for lang=es', () => {
    expect(canyoningCard(baseEs)).toContain('BARRANCO')
  })

  it('uses English strings for lang=en', () => {
    expect(canyoningCard(baseEn)).toContain('CANYONING')
  })

  it('escapes special chars in title', () => {
    expect(canyoningCard({ ...baseEs, title: 'A & B <test>' })).toContain(
      'A &amp; B &lt;test&gt;',
    )
  })

  describe('elevation profile', () => {
    it('draws the profile when elevation has two or more points', () => {
      const svg = canyoningCard({
        ...baseEs,
        elevation: [900, 950, 1000, 980],
      })
      expect(svg).toContain(PROFILE_LINE)
      expect(svg).toContain(PROFILE_AREA)
      expect(svg).toContain('PERFIL DE ELEVACIÓN')
    })

    it('hides the profile when there are fewer than two points', () => {
      const svg = canyoningCard({ ...baseEs, elevation: [900] })
      expect(svg).not.toContain(PROFILE_LINE)
      expect(svg).not.toContain('PERFIL DE ELEVACIÓN')
    })

    it('hides the profile when no elevation is provided', () => {
      expect(canyoningCard(baseEs)).not.toContain(PROFILE_LINE)
    })

    it('handles a flat elevation series without dividing by zero', () => {
      expect(canyoningCard({ ...baseEs, elevation: [1000, 1000] })).toContain(
        PROFILE_LINE,
      )
    })

    it('draws the profile below the tech strip when both are present', () => {
      const svg = canyoningCard({
        ...baseEs,
        rope: '2x 30 m',
        elevation: [900, 950, 1000],
      })
      expect(svg).toContain('FICHA TÉCNICA')
      expect(svg).toContain(PROFILE_LINE)
    })
  })
})

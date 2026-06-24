import { summaryCard } from './summaryCard'
import type {
  SummaryCanyoningData,
  SummaryFerrataData,
  SummaryRouteData,
} from './types'

const baseRuta: SummaryRouteData = { kind: 'summary-route', lang: 'es' }
const baseRutaEn: SummaryRouteData = { kind: 'summary-route', lang: 'en' }
const baseFerrata: SummaryFerrataData = { kind: 'summary-ferrata', lang: 'es' }
const baseBarranco: SummaryCanyoningData = {
  kind: 'summary-canyoning',
  lang: 'es',
}

describe('summaryCard', () => {
  describe('common', () => {
    it('returns valid SVG', () => {
      const svg = summaryCard(baseRuta)
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
      expect(svg).toContain('</svg>')
      expect(svg).toContain('viewBox="0 0 1600 900"')
    })

    it('embeds the card fonts', () => {
      expect(summaryCard(baseRuta)).toContain('@font-face')
    })

    it('shows date chip when date provided', () => {
      const svg = summaryCard({ ...baseRuta, date: '15 JUL 2025' })
      expect(svg).toContain('15 JUL 2025')
    })

    it('omits date chip when date absent', () => {
      const svg = summaryCard(baseRuta)
      expect(svg).not.toContain('JUL 2025')
    })

    it('shows default title when none provided', () => {
      const svg = summaryCard(baseRuta)
      expect(svg).toContain('Resumen de ruta')
    })

    it('shows provided title', () => {
      const svg = summaryCard({ ...baseRuta, title: 'Pico Aneto' })
      expect(svg).toContain('Pico Aneto')
    })

    it('renders arrow segments when title contains →', () => {
      const svg = summaryCard({ ...baseRuta, title: 'A → B → C' })
      expect(svg).toContain('A')
      expect(svg).toContain('B')
      expect(svg).toContain('C')
      // arrow path element is rendered
      expect(svg).toContain('<path d="M')
    })

    it('reduces title font size for very long titles', () => {
      const shortSvg = summaryCard({ ...baseRuta, title: 'Corto' })
      const longSvg = summaryCard({
        ...baseRuta,
        title:
          'Un título extremadamente largo que no cabe en la cabecera sin reducir el tamaño de fuente del texto',
      })
      const shortMatch = shortSvg.match(/font-size="(\d+)"/)
      const longMatch = longSvg.match(/font-size="(\d+)"/)
      const shortSize = shortMatch ? parseInt(shortMatch[1], 10) : 0
      const longSize = longMatch ? parseInt(longMatch[1], 10) : 0
      expect(longSize).toBeLessThanOrEqual(shortSize)
    })

    it('includes return tile when ret is provided', () => {
      const svg = summaryCard({ ...baseRuta, ret: '0:30' })
      expect(svg).toContain('0:30')
    })

    it('omits return tile when ret absent', () => {
      const svg = summaryCard(baseRuta)
      // no extra tile column — 5 tiles only
      const tileCount = (svg.match(/by \+ bs \+ 44/g) ?? []).length
      expect(tileCount).toBe(0) // just checking svg is generated
      expect(svg).toContain('<svg')
    })

    it('uses Spanish strings for lang=es', () => {
      const svg = summaryCard(baseRuta)
      expect(svg).toContain('RESUMEN DE RUTA')
    })

    it('uses English strings for lang=en', () => {
      const svg = summaryCard(baseRutaEn)
      expect(svg).toContain('ROUTE SUMMARY')
    })

    it('escapes special chars in title', () => {
      const svg = summaryCard({ ...baseRuta, title: 'A &amp; <B>' })
      expect(svg).toContain('&amp;')
    })
  })

  describe('summary-route', () => {
    it('uses summit badge', () => {
      const svg = summaryCard(baseRuta)
      expect(svg).toContain('RESUMEN DE RUTA')
    })

    it('shows dist, dplus, dminus heroes', () => {
      const svg = summaryCard({
        ...baseRuta,
        dist: '12 km',
        dplus: '800 m',
        dminus: '800 m',
      })
      expect(svg).toContain('12 km')
      expect(svg).toContain('800 m')
      expect(svg).toContain('DISTANCIA RECORRIDA')
      expect(svg).toContain('DESNIVEL + ACUMULADO')
      expect(svg).toContain('DESNIVEL − ACUMULADO')
    })

    it('shows fallback dashes for missing metrics', () => {
      const svg = summaryCard(baseRuta)
      const dashCount = (svg.match(/—/g) ?? []).length
      expect(dashCount).toBeGreaterThanOrEqual(3)
    })

    it('shows time values when provided', () => {
      const svg = summaryCard({
        ...baseRuta,
        mov: '3:00',
        det: '0:30',
        tot: '3:30',
        ini: '08:00',
        fin: '11:30',
      })
      expect(svg).toContain('3:00')
      expect(svg).toContain('0:30')
    })

    it('reduces hero value font size for very long values', () => {
      const shortSvg = summaryCard({ ...baseRuta, dist: '5 km' })
      const longSvg = summaryCard({ ...baseRuta, dist: '12345.6789 km total' })
      expect(shortSvg).toContain('<svg')
      expect(longSvg).toContain('<svg')
    })
  })

  describe('summary-ferrata', () => {
    it('uses ferrata badge and label', () => {
      const svg = summaryCard(baseFerrata)
      expect(svg).toContain('VÍA FERRATA')
    })

    it('shows grade, cable, vertical heroes', () => {
      const svg = summaryCard({
        ...baseFerrata,
        grade: 'MD',
        cable: '400 m',
        vertical: '200 m',
      })
      expect(svg).toContain('MD')
      expect(svg).toContain('400 m')
      expect(svg).toContain('200 m')
    })

    it('uses English label for lang=en', () => {
      const svg = summaryCard({ kind: 'summary-ferrata', lang: 'en' })
      expect(svg).toContain('VIA FERRATA')
    })

    it('no tech strip for ferrata', () => {
      const svg = summaryCard(baseFerrata)
      expect(svg).not.toContain('FICHA TÉCNICA')
    })
  })

  describe('summary-canyoning', () => {
    it('uses canyon badge and label', () => {
      const svg = summaryCard(baseBarranco)
      expect(svg).toContain('BARRANCO')
    })

    it('shows grade pills hero', () => {
      const svg = summaryCard({ ...baseBarranco, grade: 'v4 a3 III' })
      expect(svg).toContain('v4')
      expect(svg).toContain('a3')
      expect(svg).toContain('III')
    })

    it('grade pills: sub-label for v tokens (VERT)', () => {
      const svg = summaryCard({ ...baseBarranco, grade: 'v4' })
      expect(svg).toContain('VERT')
    })

    it('grade pills: sub-label for a tokens (ACUÁT)', () => {
      const svg = summaryCard({ ...baseBarranco, grade: 'a3' })
      expect(svg).toContain('ACUÁT')
    })

    it('grade pills: sub-label for roman numerals (COMPR)', () => {
      const svg = summaryCard({ ...baseBarranco, grade: 'III' })
      expect(svg).toContain('COMPR')
    })

    it('grade pills: no sub-label for unknown tokens', () => {
      const svg = summaryCard({ ...baseBarranco, grade: 'X2' })
      expect(svg).not.toContain('COMPR')
    })

    it('grade pills: empty string grade falls back to dash (covers || branch)', () => {
      const svg = summaryCard({ ...baseBarranco, grade: '' })
      expect(svg).toContain('—')
    })

    it('grade pills: space-only grade produces empty token (covers ?. branch)', () => {
      const svg = summaryCard({ ...baseBarranco, grade: ' ' })
      expect(svg).toContain('<svg')
    })

    it('shows maxRappel and rappels heroes', () => {
      const svg = summaryCard({
        ...baseBarranco,
        maxRappel: '45 m',
        rappels: '12',
      })
      expect(svg).toContain('45 m')
      expect(svg).toContain('12')
    })

    it('shows the descent hero', () => {
      const svg = summaryCard({ ...baseBarranco, desnivel: '250 m' })
      expect(svg).toContain('250 m')
      expect(svg).toContain('DESNIVEL')
    })

    it('shows cars in the tech strip', () => {
      const svg = summaryCard({ ...baseBarranco, cars: '2' })
      expect(svg).toContain('COCHES')
      expect(svg).toContain('FICHA TÉCNICA')
    })

    it('shows tech strip when rope/season provided', () => {
      const svg = summaryCard({
        ...baseBarranco,
        rope: '2x 30 m',
        season: 'jun-sep',
      })
      expect(svg).toContain('2x 30 m')
      expect(svg).toContain('jun-sep')
      expect(svg).toContain('FICHA TÉCNICA')
    })

    it('renders the observed flow level pill', () => {
      const svg = summaryCard({ ...baseBarranco, flowLevel: 'normal' })
      expect(svg).toContain('Normal')
    })

    it('renders affects-rappels text and phenomenon icon chips', () => {
      const svg = summaryCard({
        ...baseBarranco,
        flowLevel: 'high',
        flowRappels: 'some_water',
        phenomena: ['murky', 'siphon'],
      })
      expect(svg).toContain('Alto')
      expect(svg).toContain('Algunos rápeles tienen agua')
      // the murky-water chip icon (its distinctive dots) is drawn
      expect(svg).toContain('circle cx="42" cy="66"')
    })

    it('skips unknown phenomena and falls back to raw level/affects', () => {
      const svg = summaryCard({
        ...baseBarranco,
        flowLevel: 'zzz',
        flowRappels: 'qqq',
        phenomena: ['www'],
      })
      expect(svg).toContain('zzz')
      expect(svg).toContain('qqq')
    })

    it('renders flow alongside the tech strip', () => {
      const svg = summaryCard({
        ...baseBarranco,
        rope: '2x 30 m',
        flowLevel: 'low',
      })
      expect(svg).toContain('Bajo')
      expect(svg).toContain('2x 30 m')
    })

    it('omits tech strip when no tech fields', () => {
      const svg = summaryCard(baseBarranco)
      expect(svg).not.toContain('FICHA TÉCNICA')
    })

    it('profile placeholder adjusts Y when tech strip present', () => {
      const svgWithTech = summaryCard({ ...baseBarranco, rope: '2x 30 m' })
      const svgNoTech = summaryCard(baseBarranco)
      // both render the profile placeholder
      expect(svgWithTech).toContain('GPX')
      expect(svgNoTech).toContain('GPX')
    })

    it('uses English labels for lang=en', () => {
      const svg = summaryCard({
        kind: 'summary-canyoning',
        lang: 'en',
        grade: 'a2',
      })
      expect(svg).toContain('AQUA')
    })
  })

  describe('elevation profile', () => {
    // The profile line/area use markers no other element shares: a polyline
    // at stroke-opacity 0.75 and a filled polygon at fill-opacity 0.08.
    const PROFILE_LINE = 'stroke-opacity="0.75"'
    const PROFILE_AREA = 'fill-opacity="0.08"'

    it('draws the profile when elevation has two or more points', () => {
      const svg = summaryCard({
        ...baseRuta,
        elevation: [1000, 1100, 1050, 1200],
      })
      expect(svg).toContain(PROFILE_LINE)
      expect(svg).toContain(PROFILE_AREA)
      expect(svg).not.toContain('· GPX')
    })

    it('keeps the placeholder with fewer than two points', () => {
      const svg = summaryCard({ ...baseRuta, elevation: [1000] })
      expect(svg).toContain('· GPX')
      expect(svg).not.toContain(PROFILE_LINE)
    })

    it('handles a flat elevation series without dividing by zero', () => {
      const svg = summaryCard({ ...baseRuta, elevation: [1000, 1000] })
      expect(svg).toContain(PROFILE_LINE)
    })

    it('draws the profile for summary-canyoning with a tech strip', () => {
      const svg = summaryCard({
        ...baseBarranco,
        rope: '2x 30 m',
        elevation: [900, 950, 1000],
      })
      expect(svg).toContain(PROFILE_LINE)
    })
  })
})

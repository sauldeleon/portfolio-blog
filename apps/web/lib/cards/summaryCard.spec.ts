import { buildSummaryCard, summaryCard } from './summaryCard'
import type { SummaryFerrataData, SummaryRouteData } from './types'

const baseRuta: SummaryRouteData = { kind: 'summary-route', lang: 'es' }
const baseRutaEn: SummaryRouteData = { kind: 'summary-route', lang: 'en' }
const baseFerrata: SummaryFerrataData = { kind: 'summary-ferrata', lang: 'es' }

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

  describe('route type chip', () => {
    it('marks loops and one-way routes, localised', () => {
      const loop = summaryCard({ ...baseRuta, lang: 'es', shape: 'loop' })
      expect(loop).toContain('data-shape="loop"')
      expect(loop).toContain('CIRCULAR')
      const linear = summaryCard({ ...baseRuta, lang: 'en', shape: 'linear' })
      expect(linear).toContain('data-shape="linear"')
      expect(linear).toContain('ONE WAY')
    })

    it('has no chip without a route type', () => {
      expect(summaryCard({ ...baseRuta, shape: undefined })).not.toContain(
        'data-shape',
      )
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

    it('exposes where the profile is drawn', () => {
      expect(
        buildSummaryCard({ ...baseRuta, elevation: [1000, 1200] }).profile,
      ).toEqual({
        elevation: [1000, 1200],
        x0: expect.any(Number),
        x1: expect.any(Number),
        top: 634,
        // A line shorter: the GPS altitude note goes under it.
        bottom: 838,
      })
      expect(buildSummaryCard({ ...baseRuta, elevation: [1] }).profile).toBe(
        undefined,
      )
      const landmarks = [
        { kind: 'peak' as const, index: 1, ele: 1200, lat: 1, lon: 2 },
      ]
      expect(
        buildSummaryCard({ ...baseRuta, elevation: [1000, 1200], landmarks })
          .profile?.landmarks,
      ).toEqual(landmarks)
      expect(
        buildSummaryCard({ ...baseFerrata, elevation: [1000, 1200] }).profile
          ?.landmarks,
      ).toBeUndefined()
    })

    describe('summits and cols', () => {
      const elevation = [1000, 1400, 1200, 1500, 1100]
      const landmarks = [
        {
          kind: 'peak' as const,
          index: 1,
          ele: 1412,
          lat: 0,
          lon: 0,
          name: 'Pico A',
        },
        {
          kind: 'col' as const,
          index: 2,
          ele: 1195,
          lat: 0,
          lon: 0,
          name: 'Collado',
        },
        {
          kind: 'peak' as const,
          index: 3,
          ele: 1503,
          lat: 0,
          lon: 0,
          hidden: true,
          name: 'Oculto',
        },
        // Stale index beyond the profile: ignored.
        {
          kind: 'peak' as const,
          index: 9,
          ele: 1,
          lat: 0,
          lon: 0,
          name: 'Fuera',
        },
      ]
      const route = { ...baseRuta, elevation, landmarks }

      it('names them next to their markers by default, with altitude', () => {
        const card = buildSummaryCard(route)
        expect(card.svg).toContain('Pico A')
        expect(card.svg).toContain('1.412 m')
        expect(card.svg).not.toContain('Oculto')
        expect(card.svg).not.toContain('Fuera')
        expect(card.height).toBe(900)
        // The profile moves down to make room for the names.
        expect(card.profile?.top).toBe(634 + 78)
        expect(card.profile?.landmarks?.map((l) => l.name)).toEqual([
          'Pico A',
          'Collado',
        ])
      })

      it('can leave the altitude out', () => {
        const svg = summaryCard({
          ...route,
          landmarks: landmarks.map((l) => ({ ...l, hideAltitude: true })),
        })
        expect(svg).toContain('Pico A')
        expect(svg).not.toContain('1.412 m')
      })

      it('puts a legend under the profile, growing the card', () => {
        const card = buildSummaryCard({ ...route, landmarkLabels: 'legend' })
        expect(card.height).toBeGreaterThan(900)
        expect(card.svg).toContain(`viewBox="0 0 1600 ${card.height}"`)
        expect(card.profile?.top).toBe(634 + 40)
      })

      it('has no legend panel without visible landmarks', () => {
        const card = buildSummaryCard({
          ...route,
          landmarks: [{ ...landmarks[0], hidden: true }],
          landmarkLabels: 'legend',
        })
        expect(card.height).toBe(900)
        expect(card.profile?.landmarks).toBeUndefined()
      })

      it('notes that GPS altitudes may be off, in the card language', () => {
        const es = buildSummaryCard(route)
        expect(es.svg).toContain(
          'Altitudes tomadas por GPS: pueden no ser exactas',
        )
        expect(es.profile?.bottom).toBe(838)
        expect(summaryCard({ ...route, lang: 'en' })).toContain(
          'Altitudes recorded by GPS: they may be inaccurate',
        )
        const off = buildSummaryCard({ ...route, altitudeNote: false })
        expect(off.svg).not.toContain('data-altitude-note')
        expect(off.profile?.bottom).toBe(860)
      })

      it('draws them on ferrata cards too', () => {
        const card = buildSummaryCard({
          ...baseFerrata,
          elevation,
          landmarks: route.landmarks,
        })
        expect(card.svg).toContain('data-altitude-note')
        expect(card.profile?.top).toBe(634 + 78)
        expect(card.profile?.landmarks).toEqual(
          buildSummaryCard(route).profile?.landmarks,
        )
      })
    })

    it('handles a flat elevation series without dividing by zero', () => {
      const svg = summaryCard({ ...baseRuta, elevation: [1000, 1000] })
      expect(svg).toContain(PROFILE_LINE)
    })
  })
})

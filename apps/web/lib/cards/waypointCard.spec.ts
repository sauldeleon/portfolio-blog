import { waypointCard } from './waypointCard'
import type { WaypointCardData } from './waypointCard'

const base: WaypointCardData = {
  name: 'Refugio',
  lat: 42.5,
  lon: -1.2,
  ele: 1850,
  emin: 1200,
  emax: 2500,
  category: 'refugio',
  lang: 'es',
}

describe('waypointCard', () => {
  it('returns a 1080x320 SVG with embedded fonts', () => {
    const svg = waypointCard(base)
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('viewBox="0 0 1080 320"')
    expect(svg).toContain('@font-face')
  })

  it('renders coordinates, elevation and the category label (es)', () => {
    const svg = waypointCard(base)
    expect(svg).toContain('42.50000, -1.20000')
    expect(svg).toContain('1850 m')
    expect(svg).toContain('REFUGIO')
  })

  it('uses English category labels for lang=en', () => {
    const svg = waypointCard({ ...base, lang: 'en' })
    expect(svg).toContain('MOUNTAIN HUT')
  })

  it('falls back to the info label for an unknown category', () => {
    const svg = waypointCard({ ...base, category: 'zzz', lang: 'en' })
    expect(svg).toContain('POINT OF INTEREST')
  })

  it('renders the altimeter marker and the scale bounds', () => {
    const svg = waypointCard(base)
    expect(svg).toContain('2500')
    expect(svg).toContain('1200')
    expect(svg).toContain('url(#altgrad)')
  })

  it('handles a flat altimeter scale (emax == emin)', () => {
    const svg = waypointCard({ ...base, emin: 1850, emax: 1850 })
    expect(svg).toContain('<svg')
  })

  it('wraps a long title onto two balanced lines', () => {
    // many short words -> several balanced split points are evaluated
    const svg = waypointCard({
      ...base,
      name: 'aa bb cc dd ee ff gg hh ii jj',
    })
    // two title <text> baselines are emitted (y=160 and the second line)
    expect(svg).toContain('y="160"')
  })

  it('breaks an unsplittable long single word at the smallest size', () => {
    const svg = waypointCard({ ...base, name: 'A'.repeat(60) })
    expect(svg).toContain('font-size="34"')
  })
})

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

  it('omits coordinates and the crosshair when lat/lon are not given', () => {
    const svg = waypointCard({ ...base, lat: undefined, lon: undefined })
    // still draws elevation
    expect(svg).toContain('1850 m')
    // no coordinate text and no crosshair marker
    expect(svg).not.toContain('42.50000, -1.20000')
    expect(svg).not.toContain('r="8.5"')
  })

  it('omits coordinates when only one of lat/lon is given', () => {
    expect(waypointCard({ ...base, lon: undefined })).not.toContain('r="8.5"')
    expect(waypointCard({ ...base, lat: undefined })).not.toContain('r="8.5"')
  })

  it('omits coordinates when lat/lon are not finite', () => {
    expect(waypointCard({ ...base, lat: NaN })).not.toContain('r="8.5"')
    expect(waypointCard({ ...base, lon: NaN })).not.toContain('r="8.5"')
  })

  it('omits the elevation value and the altimeter when ele is not given', () => {
    const svg = waypointCard({ ...base, ele: undefined })
    expect(svg).not.toContain('1850 m')
    expect(svg).not.toContain('url(#altgrad)')
    // scale-bound labels are gone too
    expect(svg).not.toContain('>2500<')
    // coordinates still render
    expect(svg).toContain('42.50000, -1.20000')
  })

  it('omits the elevation when ele is not finite', () => {
    expect(waypointCard({ ...base, ele: NaN })).not.toContain('url(#altgrad)')
  })

  it('renders an empty data row when neither coordinates nor ele are given', () => {
    const svg = waypointCard({
      ...base,
      lat: undefined,
      lon: undefined,
      ele: undefined,
    })
    expect(svg).not.toContain('r="8.5"')
    expect(svg).not.toContain('url(#altgrad)')
    expect(svg).toContain('<svg')
  })
})

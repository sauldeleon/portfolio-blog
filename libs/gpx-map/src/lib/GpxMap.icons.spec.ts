import {
  MAP_ICON_ANCHOR,
  MAP_ICON_END,
  MAP_ICON_SIZE,
  MAP_ICON_START,
  MAP_ICON_WPT,
  TRANSPARENT_1PX,
  WPT_ICON_URLS,
} from './GpxMap.icons'

describe('GpxMap icons', () => {
  it('MAP_ICON_START is an SVG data URL', () => {
    expect(MAP_ICON_START).toMatch(/^data:image\/svg\+xml,/)
    expect(decodeURIComponent(MAP_ICON_START)).toContain('#22c55e')
  })

  it('MAP_ICON_END is an SVG data URL', () => {
    expect(MAP_ICON_END).toMatch(/^data:image\/svg\+xml,/)
    expect(decodeURIComponent(MAP_ICON_END)).toContain('#ef4444')
  })

  it('MAP_ICON_WPT is an SVG data URL', () => {
    expect(MAP_ICON_WPT).toMatch(/^data:image\/svg\+xml,/)
    expect(decodeURIComponent(MAP_ICON_WPT)).toContain('#3b82f6')
  })

  it('MAP_ICON_SIZE is [20, 26]', () => {
    expect(MAP_ICON_SIZE).toEqual([20, 26])
  })

  it('MAP_ICON_ANCHOR is [10, 26]', () => {
    expect(MAP_ICON_ANCHOR).toEqual([10, 26])
  })

  it('TRANSPARENT_1PX is a GIF data URL', () => {
    expect(TRANSPARENT_1PX).toMatch(/^data:image\/gif;base64,/)
  })

  it('all base SVG icons contain valid SVG structure', () => {
    for (const icon of [MAP_ICON_START, MAP_ICON_END, MAP_ICON_WPT]) {
      const svg = decodeURIComponent(icon)
      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    }
  })

  it('WPT_ICON_URLS has empty string default key', () => {
    expect(WPT_ICON_URLS['']).toBeDefined()
    expect(WPT_ICON_URLS['']).toMatch(/^data:image\/svg\+xml,/)
  })

  it('WPT_ICON_URLS maps all values to SVG data URLs', () => {
    for (const url of Object.values(WPT_ICON_URLS)) {
      expect(url).toMatch(/^data:image\/svg\+xml,/)
    }
  })

  it('WPT_ICON_URLS maps Warning to amber pin with warning triangle', () => {
    const svg = decodeURIComponent(WPT_ICON_URLS['Warning'])
    expect(svg).toContain('#f59e0b')
    expect(svg).toContain('<polygon')
  })

  it('WPT_ICON_URLS maps Summit to purple pin', () => {
    expect(decodeURIComponent(WPT_ICON_URLS['Summit'])).toContain('#8b5cf6')
  })

  it('WPT_ICON_URLS maps Campground to emerald pin', () => {
    expect(decodeURIComponent(WPT_ICON_URLS['Campground'])).toContain('#10b981')
  })

  it('WPT_ICON_URLS maps Water Source to sky-blue pin', () => {
    expect(decodeURIComponent(WPT_ICON_URLS['Water Source'])).toContain(
      '#0ea5e9',
    )
  })

  it('WPT_ICON_URLS maps Restaurant to orange pin', () => {
    expect(decodeURIComponent(WPT_ICON_URLS['Restaurant'])).toContain('#f97316')
  })

  it('WPT_ICON_URLS maps Parking Area to slate pin', () => {
    expect(decodeURIComponent(WPT_ICON_URLS['Parking Area'])).toContain(
      '#64748b',
    )
  })

  it('WPT_ICON_URLS maps Medical Facility to red pin', () => {
    expect(decodeURIComponent(WPT_ICON_URLS['Medical Facility'])).toContain(
      '#dc2626',
    )
  })

  it('WPT_ICON_URLS maps Bike Trail to cyan pin', () => {
    expect(decodeURIComponent(WPT_ICON_URLS['Bike Trail'])).toContain('#06b6d4')
  })

  it('WPT_ICON_URLS maps Scenic Area to pink pin', () => {
    expect(decodeURIComponent(WPT_ICON_URLS['Scenic Area'])).toContain(
      '#ec4899',
    )
  })
})

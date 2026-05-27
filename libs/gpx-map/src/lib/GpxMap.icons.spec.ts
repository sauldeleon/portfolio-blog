import {
  MAP_ICON_ANCHOR,
  MAP_ICON_END,
  MAP_ICON_SIZE,
  MAP_ICON_START,
  MAP_ICON_WPT,
  TRANSPARENT_1PX,
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

  it('MAP_ICON_SIZE is [25, 33]', () => {
    expect(MAP_ICON_SIZE).toEqual([25, 33])
  })

  it('MAP_ICON_ANCHOR is [12, 33]', () => {
    expect(MAP_ICON_ANCHOR).toEqual([12, 33])
  })

  it('TRANSPARENT_1PX is a GIF data URL', () => {
    expect(TRANSPARENT_1PX).toMatch(/^data:image\/gif;base64,/)
  })

  it('all SVG icons contain valid SVG structure', () => {
    for (const icon of [MAP_ICON_START, MAP_ICON_END, MAP_ICON_WPT]) {
      const svg = decodeURIComponent(icon)
      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    }
  })
})

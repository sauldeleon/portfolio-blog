import {
  glyphFor,
  glyphRapel,
  glyphSalto,
  glyphTobogan,
  river,
  rowReturn,
  scene,
  waterfall,
} from './croquisGlyphs'

describe('croquisGlyphs', () => {
  it('waterfall draws three water strokes', () => {
    const s = waterfall(100, 50, 200)
    expect((s.match(/<path /g) ?? []).length).toBe(3)
  })

  it('glyphRapel includes the rope, anchor and waterfall', () => {
    const s = glyphRapel(100, 50, 180)
    expect(s).toContain('stroke-dasharray="1 6"') // rope
    expect(s).toContain('<circle') // anchor
  })

  it('glyphTobogan draws the chute curve', () => {
    const s = glyphTobogan(100, 50, 180, 120)
    expect(s).toContain('<path')
    expect(s).toContain('C ')
  })

  it('glyphSalto draws the jump arc and pool', () => {
    const s = glyphSalto(100, 50, 180, 120)
    expect(s).toContain('stroke-dasharray="7 6"') // arc
    expect(s).toContain('<ellipse') // pool
  })

  it('river is an animated flow path', () => {
    expect(river(0, 0, 100, 100)).toContain('class="flow"')
  })

  it('rowReturn is a dashed flow sweep', () => {
    const s = rowReturn(200, 100, 40, 300)
    expect(s).toContain('class="flow"')
    expect(s).toContain('stroke-dasharray="2 7"')
  })

  describe('glyphFor', () => {
    it('stacks jump + rappel for a combo', () => {
      const s = glyphFor('salto-rapel', 100, 50, 180, 120)
      expect(s).toContain('stroke-dasharray="7 6"') // salto arc
      expect(s).toContain('stroke-dasharray="1 6"') // rappel rope
    })

    it('draws a rappel', () => {
      expect(glyphFor('rapel', 100, 50, 180, 120)).toContain(
        'stroke-dasharray="1 6"',
      )
    })

    it('draws a slide', () => {
      const s = glyphFor('tobogan', 100, 50, 180, 120)
      expect(s).not.toContain('stroke-dasharray="1 6"')
      expect(s).toContain('<path')
    })

    it('draws a jump', () => {
      expect(glyphFor('salto', 100, 50, 180, 120)).toContain(
        'stroke-dasharray="7 6"',
      )
    })
  })

  describe('scene', () => {
    it.each(['salto-rapel', 'rapel', 'tobogan', 'salto'] as const)(
      'renders an illustration for %s',
      (type) => {
        const s = scene(type)
        expect(s).toContain('<svg viewBox="0 0 260 128">')
        expect(s).toContain('</svg>')
      },
    )
  })
})

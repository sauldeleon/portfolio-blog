import { type IconKind, iconPath } from './icons'

const ALL_KINDS: IconKind[] = [
  'refugio',
  'fuente',
  'cruce',
  'info',
  'cascada',
  'summit',
  'alert',
  'glacier',
  'route',
  'climb',
  'descent',
  'hiker',
  'pause',
  'clock',
  'sunrise',
  'sunset',
  'ferrata',
  'cable',
  'vertical',
  'canyon',
  'rappel',
  'drops',
  'return',
]

describe('iconPath', () => {
  it.each(ALL_KINDS)(
    'returns non-empty SVG path string for kind "%s"',
    (kind) => {
      const result = iconPath(kind)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      expect(result).toContain('<path')
    },
  )

  it('uses default stroke-width of 5.4', () => {
    const result = iconPath('canyon')
    expect(result).toContain('stroke-width="5.4"')
  })

  it('accepts custom stroke-width', () => {
    const result = iconPath('canyon', 3.0)
    expect(result).toContain('stroke-width="3"')
  })

  it('returns info path as fallback for unknown kind', () => {
    const fallback = iconPath('info')
    // calling with a cast unknown value falls back
    const unknown = iconPath('unknown' as IconKind)
    expect(unknown).toBe(fallback)
  })
})

import { type IconKind, iconPath } from './icons'
import { AMBER } from './theme'

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
  'ph_backwash',
  'ph_current',
  'ph_murky',
  'ph_siphon',
  'ph_rain',
  'ph_none',
  'poza',
  'slide',
  'downclimb',
  'arrow_left',
  'arrow_right',
]

describe('iconPath', () => {
  it.each(ALL_KINDS)('returns amber artwork for kind "%s"', (kind) => {
    const result = iconPath(kind)
    expect(result).toMatch(/^<g transform="scale\(0\.390625\)" fill="#F4B83C">/)
    expect(result).toMatch(/<(path|circle|ellipse|rect)\b/)
    expect(result).not.toContain('currentColor')
  })

  it('uses a duotone fill for volume', () => {
    expect(iconPath('summit')).toContain('opacity="0.2"')
    expect(iconPath('canyon')).toContain('opacity="0.2"')
  })

  it('colours stroked artwork amber', () => {
    expect(iconPath('canyon')).toContain(`stroke="${AMBER}"`)
  })

  it('gives every kind its own artwork', () => {
    const artwork = new Set(ALL_KINDS.map((kind) => iconPath(kind)))
    expect(artwork.size).toBe(ALL_KINDS.length)
  })

  it('falls back to the info icon for an unknown kind', () => {
    expect(iconPath('unknown' as IconKind)).toBe(iconPath('info'))
  })
})

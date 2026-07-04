import {
  badge,
  columnDivider,
  contours,
  esc,
  eyebrow,
  flowRow,
  gradeAxis,
  gradeSubLabel,
  hRule,
  tw,
} from './primitives'
import { STRINGS } from './theme'

describe('esc', () => {
  it('escapes ampersand', () => {
    expect(esc('a & b')).toBe('a &amp; b')
  })

  it('escapes less-than', () => {
    expect(esc('a < b')).toBe('a &lt; b')
  })

  it('escapes greater-than', () => {
    expect(esc('a > b')).toBe('a &gt; b')
  })

  it('escapes double quotes', () => {
    expect(esc('"hello"')).toBe('&quot;hello&quot;')
  })

  it('escapes multiple specials in one string', () => {
    expect(esc('<a href="x">&</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;',
    )
  })

  it('returns plain string unchanged', () => {
    expect(esc('hello world')).toBe('hello world')
  })
})

describe('tw', () => {
  it('returns 0 for empty string', () => {
    expect(tw('', 'mono', 20)).toBe(0)
  })

  it('scales with font size for mono', () => {
    const w10 = tw('A', 'mono', 10)
    const w20 = tw('A', 'mono', 20)
    expect(w20).toBeCloseTo(w10 * 2)
  })

  it('scales with font size for bold', () => {
    const w10 = tw('A', 'bold', 10)
    const w20 = tw('A', 'bold', 20)
    expect(w20).toBeCloseTo(w10 * 2)
  })

  it('scales linearly with string length', () => {
    const w1 = tw('A', 'mono', 20)
    const w3 = tw('AAA', 'mono', 20)
    expect(w3).toBeCloseTo(w1 * 3)
  })

  it('mono wider ratio than bold (both same char count)', () => {
    const wMono = tw('AAAA', 'mono', 20)
    const wBold = tw('AAAA', 'bold', 20)
    expect(wMono).toBeGreaterThan(wBold)
  })
})

describe('badge', () => {
  it('returns SVG string containing rect and g elements', () => {
    const result = badge(10, 20, 80, 'canyon')
    expect(result).toContain('<rect')
    expect(result).toContain('<g transform=')
  })

  it('uses provided x/y position', () => {
    const result = badge(50, 60, 80, 'canyon')
    expect(result).toContain('x="50"')
    expect(result).toContain('y="60"')
  })

  it('falls back to info icon for unknown kind', () => {
    const result = badge(0, 0, 80, 'info')
    expect(result).toContain('<circle')
  })
})

describe('contours', () => {
  it('returns one polyline per row', () => {
    const result = contours(
      [
        [50, 10],
        [100, 20],
      ],
      0,
      100,
    )
    const count = (result.match(/<polyline/g) ?? []).length
    expect(count).toBe(2)
  })

  it('generates n+1 points per polyline', () => {
    const result = contours([[50, 10]], 0, 100, 4)
    // 5 points → 5 "x,y" pairs in the points attribute
    const pointsMatch = result.match(/points="([^"]+)"/)
    expect(pointsMatch).not.toBeNull()
    const points = pointsMatch![1].trim().split(' ')
    expect(points).toHaveLength(5)
  })

  it('returns empty string for empty rows', () => {
    expect(contours([], 0, 100)).toBe('')
  })
})

describe('eyebrow', () => {
  it('returns SVG rect + text', () => {
    const result = eyebrow(56, 200, 'HELLO')
    expect(result).toContain('<rect')
    expect(result).toContain('HELLO')
  })

  it('escapes special chars in text', () => {
    const result = eyebrow(0, 0, 'A & B')
    expect(result).toContain('A &amp; B')
  })
})

describe('columnDivider', () => {
  it('returns a line element', () => {
    const result = columnDivider(100, 50, 200)
    expect(result).toContain('<line')
    expect(result).toContain('y1="50"')
    expect(result).toContain('y2="200"')
  })
})

describe('hRule', () => {
  it('returns a horizontal line', () => {
    const result = hRule(56, 1544, 336)
    expect(result).toContain('<line')
    expect(result).toContain('x1="56"')
    expect(result).toContain('x2="1544"')
    expect(result).toContain('y1="336"')
  })
})

describe('gradeAxis', () => {
  it('maps v tokens to vert', () => {
    expect(gradeAxis('v4')).toBe('vert')
  })

  it('maps a tokens to aqua', () => {
    expect(gradeAxis('a3')).toBe('aqua')
  })

  it('maps roman numerals to commit', () => {
    expect(gradeAxis('III')).toBe('commit')
  })

  it('returns null for a v/a token without a digit', () => {
    expect(gradeAxis('v')).toBeNull()
  })

  it('returns null for unrelated tokens', () => {
    expect(gradeAxis('X2')).toBeNull()
  })

  it('returns null for an empty token', () => {
    expect(gradeAxis('')).toBeNull()
  })
})

describe('gradeSubLabel', () => {
  it('returns the vert label for v tokens', () => {
    expect(gradeSubLabel('v4', 'VERT', 'AQUA', 'COMM')).toBe('VERT')
  })

  it('returns the aqua label for a tokens', () => {
    expect(gradeSubLabel('a3', 'VERT', 'AQUA', 'COMM')).toBe('AQUA')
  })

  it('returns the commit label for roman numerals', () => {
    expect(gradeSubLabel('IV', 'VERT', 'AQUA', 'COMM')).toBe('COMM')
  })

  it('returns empty string for unrelated tokens', () => {
    expect(gradeSubLabel('X2', 'VERT', 'AQUA', 'COMM')).toBe('')
  })
})

describe('flowRow', () => {
  const S = STRINGS.es

  it('always emits a flow zone for the level pill', () => {
    const { zones } = flowRow(56, 290, 'normal', undefined, [], S)
    expect(zones).toEqual([
      {
        id: 'flow',
        kind: 'flow',
        key: 'normal',
        x: 56,
        y: 290,
        w: expect.any(Number),
        h: 40,
      },
    ])
  })

  it('emits a zone for each recognised phenomenon and skips unknown ones', () => {
    const { svg, zones } = flowRow(
      56,
      290,
      'high',
      'some_water',
      ['murky', 'zzz', 'siphon'],
      S,
    )
    const phenomena = zones.filter((z) => z.kind === 'phenomenon')
    expect(phenomena.map((z) => z.key)).toEqual(['murky', 'siphon'])
    expect(phenomena[0].id).toBe('phenomenon-murky')
    expect(svg).toContain('Algunos rápeles tienen agua')
  })

  it('omits the affects text when no affects value is given', () => {
    const { svg } = flowRow(56, 290, 'low', undefined, [], S)
    expect(svg).not.toContain('rápeles')
  })
})

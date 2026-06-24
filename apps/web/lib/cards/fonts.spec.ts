import { FONT_STYLE } from './fonts'

describe('FONT_STYLE', () => {
  it('wraps @font-face rules in a style element', () => {
    expect(FONT_STYLE.startsWith('<style>')).toBe(true)
    expect(FONT_STYLE.endsWith('</style>')).toBe(true)
    expect(FONT_STYLE).toContain('@font-face')
  })

  it('embeds Poppins and Roboto Mono as base64 woff2', () => {
    expect(FONT_STYLE).toContain("font-family:'Poppins'")
    expect(FONT_STYLE).toContain("font-family:'Roboto Mono'")
    expect(FONT_STYLE).toContain('src:url(data:font/woff2;base64,')
  })
})

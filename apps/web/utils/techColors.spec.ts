import { getTechColor } from './techColors'

describe('getTechColor', () => {
  it('returns the brand color for a known technology', () => {
    expect(getTechColor('React')).toBe('#61DAFB')
    expect(getTechColor('TypeScript')).toBe('#3178C6')
    expect(getTechColor('Next.JS')).toBe('#FFFFFF')
    expect(getTechColor('Angular JS')).toBe('#B52E31')
    expect(getTechColor('angular')).toBe('#DD0031')
    expect(getTechColor('EXPO')).toBe('#ECEDEE')
    expect(getTechColor('Socket.io')).toBe('#25C2A0')
  })

  it('returns undefined for an unknown technology', () => {
    expect(getTechColor('UnknownFramework')).toBeUndefined()
    expect(getTechColor('')).toBeUndefined()
  })
})

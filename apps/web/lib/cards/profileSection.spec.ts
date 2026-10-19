import { profileSection } from './profileSection'
import type { RouteLandmark } from './types'

const base = { lang: 'en' as const, y: 602, x0: 56, x1: 1544, height: 900 }
const elevation = [900, 1000, 800, 700]
const spot: RouteLandmark = {
  kind: 'point',
  category: 'parking',
  index: 1,
  ele: 1000,
  lat: 0,
  lon: 0,
  name: 'Parking',
}

describe('profileSection', () => {
  it('draws nothing without a profile', () => {
    expect(profileSection({ ...base, elevation: [900] })).toEqual({
      svg: '',
      extraHeight: 0,
    })
    expect(profileSection(base)).toEqual({ svg: '', extraHeight: 0 })
  })

  it('draws a bare profile down to the card edge by default', () => {
    const { svg, extraHeight, profile } = profileSection({
      ...base,
      elevation,
    })
    expect(svg).toContain('ELEVATION PROFILE')
    expect(svg).not.toContain('data-altitude-note')
    expect(extraHeight).toBe(0)
    expect(profile).toEqual({
      elevation,
      x0: 56,
      x1: 1544,
      top: 634,
      bottom: 860,
      landmarks: undefined,
    })
  })

  it('leaves room for the note and the spot labels', () => {
    const { svg, profile } = profileSection({
      ...base,
      elevation,
      landmarks: [spot, { ...spot, index: 2, hidden: true }],
      altitudeNote: true,
    })
    expect(svg).toContain('data-altitude-note')
    expect(svg).toContain('Parking')
    expect(profile?.bottom).toBe(838)
    expect(profile?.top).toBe(634 + 78)
    expect(profile?.landmarks).toEqual([spot])
  })

  it('grows the card for a legend', () => {
    const { extraHeight } = profileSection({
      ...base,
      elevation,
      landmarks: [spot],
      labels: 'legend',
    })
    expect(extraHeight).toBe(32 + 30)
  })
})

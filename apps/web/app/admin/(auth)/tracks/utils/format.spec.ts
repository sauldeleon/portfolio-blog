import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatSize,
} from './format'

describe('format', () => {
  it('formats distances', () => {
    expect(formatDistance(999.6)).toBe('1000 m')
    expect(formatDistance(1234)).toBe('1.23 km')
  })

  it('formats elevations', () => {
    expect(formatElevation(null)).toBe('—')
    expect(formatElevation(12.6)).toBe('13 m')
  })

  it('formats durations', () => {
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(3600 + 5 * 60 + 9)).toBe('1:05')
  })

  it('formats sizes', () => {
    expect(formatSize(2048)).toBe('2 KB')
    expect(formatSize(3 * 1024 * 1024)).toBe('3.0 MB')
  })
})

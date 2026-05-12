import { computeReadingTime } from './readingTime'

describe('computeReadingTime', () => {
  it('returns 1 for empty string', () => {
    expect(computeReadingTime('')).toBe(1)
  })

  it('returns 1 for whitespace-only string', () => {
    expect(computeReadingTime('   ')).toBe(1)
  })

  it('returns 1 for short content under 200 words', () => {
    expect(computeReadingTime('Hello world')).toBe(1)
  })

  it('returns 1 for exactly 200 words', () => {
    expect(computeReadingTime(Array(200).fill('word').join(' '))).toBe(1)
  })

  it('returns 2 for 201 words', () => {
    expect(computeReadingTime(Array(201).fill('word').join(' '))).toBe(2)
  })

  it('rounds up fractional minutes', () => {
    expect(computeReadingTime(Array(399).fill('word').join(' '))).toBe(2)
  })

  it('returns 2 for exactly 400 words', () => {
    expect(computeReadingTime(Array(400).fill('word').join(' '))).toBe(2)
  })
})

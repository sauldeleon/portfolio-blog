import {
  randomColor,
  randomDecimalFromInterval,
  randomIntFromInterval,
} from './random'

describe('Animation helpers', () => {
  it('randomDecimalFromInterval should work', () => {
    expect(randomDecimalFromInterval(5, 10)).toBeGreaterThanOrEqual(5)
    expect(randomDecimalFromInterval(5, 10, 'test')).not.toBeGreaterThan(11)
  })

  it('randomIntFromInterval should work', () => {
    expect(randomIntFromInterval(5, 10)).toBeGreaterThanOrEqual(5)
    expect(randomIntFromInterval(5, 10, 'test')).not.toBeGreaterThan(10)
  })

  it('randomColor should work', () => {
    expect(randomColor()).toMatch(/#.*/)
  })
})

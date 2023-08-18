import {
  animationItemSeedGenerator,
  randomColor,
  randomDecimalFromInterval,
  randomIntFromInterval,
} from './helpers'

describe('Animation helpers', () => {
  it('animationItemSeedGenerator should return an object with seeds', () => {
    expect(animationItemSeedGenerator({ id: 1 })).toEqual({
      id: 1,
      seeds: {
        horizontalDelay: expect.any(String),
        horizontalDuration: expect.any(String),
        keyframe: expect.any(String),
        rotationColor: expect.any(String),
        rotationDuration: expect.any(String),
        rotationZIndex: expect.any(String),
        rotationAmount: expect.any(String),
        verticalColor: expect.any(String),
        verticalDuration: expect.any(String),
        verticalRange: expect.any(String),
        verticalStartPoint: expect.any(String),
        verticalZIndex: expect.any(String),
      },
    })
  })

  it('randomDecimalFromInterval should work', () => {
    expect(randomDecimalFromInterval(5, 10)).toBeGreaterThanOrEqual(5)
    expect(randomDecimalFromInterval(5, 10, 'test')).not.toBeGreaterThan(11)
  })

  it('randomIntFromInterval should work', () => {
    expect(randomIntFromInterval(5, 10)).toBeGreaterThanOrEqual(5)
    expect(randomIntFromInterval(5, 10, 'test')).not.toBeGreaterThan(10)
  })

  it('randomColor should work', () => {
    expect(randomColor('test')).toContain('#df48aa')
    expect(randomColor()).toMatch(/#.*/)
  })
})

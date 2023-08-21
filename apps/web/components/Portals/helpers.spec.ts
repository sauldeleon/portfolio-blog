import { animationItemSeedGenerator } from './helpers'

describe('Animation helpers', () => {
  it('animationItemSeedGenerator should return an object with seeds', () => {
    expect(animationItemSeedGenerator({})).toEqual({
      seeds: {
        horizontalDelay: expect.any(String),
        horizontalDuration: expect.any(String),
        rotationDuration: expect.any(String),
        rotationAmount: expect.any(String),
        color: expect.any(String),
        zIndex: expect.any(String),
        verticalDuration: expect.any(String),
        verticalRange: expect.any(String),
        verticalStartPoint: expect.any(String),
      },
    })
  })
})

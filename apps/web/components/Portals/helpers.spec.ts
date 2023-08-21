import { animationItemSeedGenerator } from './helpers'

describe('Animation helpers', () => {
  it('animationItemSeedGenerator should return an object with seed', () => {
    expect(animationItemSeedGenerator({})).toEqual({
      seed: expect.any(String),
    })
  })
})

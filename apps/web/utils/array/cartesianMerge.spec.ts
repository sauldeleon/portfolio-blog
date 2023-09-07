import { cartesianMerge } from './cartesianMerge'

describe('cartesianMerge', () => {
  it('should work with empty arrays', () => {
    expect(cartesianMerge()).toEqual([])
  })

  it('should work with one array', () => {
    expect(cartesianMerge([])).toEqual([])
    expect(cartesianMerge(undefined, ['a'])).toEqual([])
  })

  it('should work with two arrays', () => {
    expect(cartesianMerge(['a'], ['b'])).toEqual(['ab'])
    expect(cartesianMerge(['a', 'b'], ['1', '2'])).toEqual([
      'a1',
      'a2',
      'b1',
      'b2',
    ])
  })
})

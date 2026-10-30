import { landmarkKeys } from './landmarkKeys'

describe('landmarkKeys', () => {
  it('numbers the spots that share a kind and sample', () => {
    expect(
      landmarkKeys([
        { kind: 'point', index: 0 },
        { kind: 'point', index: 0 },
        { kind: 'peak', index: 0 },
        { kind: 'point', index: 4 },
      ]),
    ).toEqual(['point-0-0', 'point-0-1', 'peak-0-0', 'point-4-0'])
  })
})

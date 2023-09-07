import { removeFirstPart } from './removeFirstPart'

describe('removeFirstPart', () => {
  it('should remove the first part of a path', () => {
    expect(removeFirstPart('/foo/bar')).toBe('/bar')
    expect(removeFirstPart('/foo/bar/')).toBe('/bar/')
    expect(removeFirstPart('/foo')).toBe('')
  })
})

import { cleanPathFor, isValidTrackName, stripExtension } from './trackNaming'

describe('isValidTrackName', () => {
  it.each([
    ['Pirineos 2026 - Día 1', true],
    ['', false],
    [' padded', false],
    ['.hidden', false],
    ['dir/name', false],
    ['dir\\name', false],
    ['line\nbreak', false],
    ['route-Clean', false],
    ['a'.repeat(121), false],
  ])('%j → %s', (name, valid) => {
    expect(isValidTrackName(name)).toBe(valid)
  })
})

describe('cleanPathFor', () => {
  it('appends -clean to originals and keeps clean paths', () => {
    expect(cleanPathFor('dir/a.gpx')).toBe('dir/a-clean.gpx')
    expect(cleanPathFor('a.GPX')).toBe('a-clean.gpx')
    expect(cleanPathFor('a-clean.gpx')).toBe('a-clean.gpx')
  })
})

describe('stripExtension', () => {
  it('drops the last extension only', () => {
    expect(stripExtension('Día 1.gpx')).toBe('Día 1')
    expect(stripExtension('a.b.gpx')).toBe('a.b')
    expect(stripExtension('noext')).toBe('noext')
    expect(stripExtension('.gpx')).toBe('.gpx')
  })
})

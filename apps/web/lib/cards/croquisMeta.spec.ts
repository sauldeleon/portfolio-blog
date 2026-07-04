import { parseCroquisMeta, serializeCroquisMeta } from './croquisMeta'

describe('parseCroquisMeta', () => {
  it('reads a plain title with download enabled by default', () => {
    expect(parseCroquisMeta('Barranco de la Peonera')).toEqual({
      title: 'Barranco de la Peonera',
      showDownload: true,
    })
  })

  it('reads the no-download flag and strips it from the title', () => {
    expect(parseCroquisMeta('no-download Barranco X')).toEqual({
      title: 'Barranco X',
      showDownload: false,
    })
  })

  it('handles an empty meta', () => {
    expect(parseCroquisMeta('')).toEqual({ title: '', showDownload: true })
  })

  it('handles the flag with no title', () => {
    expect(parseCroquisMeta('no-download')).toEqual({
      title: '',
      showDownload: false,
    })
  })
})

describe('serializeCroquisMeta', () => {
  it('emits just the title when download is enabled', () => {
    expect(
      serializeCroquisMeta({ title: 'Barranco X', showDownload: true }),
    ).toBe('Barranco X')
  })

  it('prefixes the flag when download is disabled', () => {
    expect(
      serializeCroquisMeta({ title: 'Barranco X', showDownload: false }),
    ).toBe('no-download Barranco X')
  })

  it('emits the flag alone when there is no title', () => {
    expect(serializeCroquisMeta({ title: '  ', showDownload: false })).toBe(
      'no-download',
    )
  })

  it('emits an empty string for a titleless downloadable croquis', () => {
    expect(serializeCroquisMeta({ title: '', showDownload: true })).toBe('')
  })

  it('round-trips through parse', () => {
    const meta = serializeCroquisMeta({ title: 'Río', showDownload: false })
    expect(parseCroquisMeta(meta)).toEqual({
      title: 'Río',
      showDownload: false,
    })
  })
})

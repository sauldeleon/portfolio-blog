import {
  decodeCanyonToken,
  encodeCanyonToken,
  parseCroquisMeta,
  serializeCroquisMeta,
} from './croquisMeta'
import type { CanyoningCardData } from './types'

const canyon: CanyoningCardData = {
  kind: 'canyoning-data',
  lang: 'es',
  title: 'Barranco de Angüés',
  grade: 'v4a3II',
  desnivel: '300m',
  approach: 'Aproximación técnica',
}

describe('parseCroquisMeta', () => {
  it('reads a plain title with everything enabled by default', () => {
    expect(parseCroquisMeta('Barranco de la Peonera')).toEqual({
      title: 'Barranco de la Peonera',
      showDownload: true,
      showReport: true,
      canyon: null,
    })
  })

  it('reads the no-download flag and strips it from the title', () => {
    expect(parseCroquisMeta('no-download Barranco X')).toEqual({
      title: 'Barranco X',
      showDownload: false,
      showReport: true,
      canyon: null,
    })
  })

  it('reads the no-report flag and strips it from the title', () => {
    expect(parseCroquisMeta('no-report Barranco X')).toEqual({
      title: 'Barranco X',
      showDownload: true,
      showReport: false,
      canyon: null,
    })
  })

  it('decodes a canyon token into the summary data', () => {
    const meta = `canyon:${encodeCanyonToken(canyon)} Barranco X`
    expect(parseCroquisMeta(meta)).toEqual({
      title: 'Barranco X',
      showDownload: true,
      showReport: true,
      canyon,
    })
  })

  it('strips all leading flags and tokens in any order', () => {
    const meta = `no-download no-report canyon:${encodeCanyonToken(canyon)} Río`
    expect(parseCroquisMeta(meta)).toEqual({
      title: 'Río',
      showDownload: false,
      showReport: false,
      canyon,
    })
  })

  it('handles an empty meta', () => {
    expect(parseCroquisMeta('')).toEqual({
      title: '',
      showDownload: true,
      showReport: true,
      canyon: null,
    })
  })

  it('handles the flag with no title', () => {
    expect(parseCroquisMeta('no-download')).toEqual({
      title: '',
      showDownload: false,
      showReport: true,
      canyon: null,
    })
  })

  it('stops stripping at the first non-flag token', () => {
    expect(parseCroquisMeta('Barranco no-download')).toEqual({
      title: 'Barranco no-download',
      showDownload: true,
      showReport: true,
      canyon: null,
    })
  })
})

describe('canyon token codec', () => {
  it('round-trips card data through encode/decode', () => {
    expect(decodeCanyonToken(encodeCanyonToken(canyon))).toEqual(canyon)
  })

  it('returns null for a corrupt (undecodable) token', () => {
    expect(decodeCanyonToken('@@@not-base64@@@')).toBeNull()
  })

  it('returns null for valid base64 that is not canyon data', () => {
    expect(decodeCanyonToken(btoa('{"foo":1}'))).toBeNull()
  })
})

describe('serializeCroquisMeta', () => {
  it('emits just the title with defaults', () => {
    expect(
      serializeCroquisMeta({ title: 'Barranco X', showDownload: true }),
    ).toBe('Barranco X')
  })

  it('prefixes the download flag when disabled', () => {
    expect(
      serializeCroquisMeta({ title: 'Barranco X', showDownload: false }),
    ).toBe('no-download Barranco X')
  })

  it('prefixes the report flag when disabled', () => {
    expect(
      serializeCroquisMeta({
        title: 'Barranco X',
        showDownload: true,
        showReport: false,
      }),
    ).toBe('no-report Barranco X')
  })

  it('embeds the canyon token when summary data is provided', () => {
    const meta = serializeCroquisMeta({
      title: 'Barranco X',
      showDownload: true,
      canyon,
    })
    expect(meta).toBe(`canyon:${encodeCanyonToken(canyon)} Barranco X`)
  })

  it('emits the flags alone when there is no title', () => {
    expect(serializeCroquisMeta({ title: '  ', showDownload: false })).toBe(
      'no-download',
    )
  })

  it('emits an empty string for a bare downloadable croquis', () => {
    expect(serializeCroquisMeta({ title: '', showDownload: true })).toBe('')
  })

  it('round-trips through parse', () => {
    const meta = serializeCroquisMeta({
      title: 'Río',
      showDownload: false,
      showReport: false,
      canyon,
    })
    expect(parseCroquisMeta(meta)).toEqual({
      title: 'Río',
      showDownload: false,
      showReport: false,
      canyon,
    })
  })
})

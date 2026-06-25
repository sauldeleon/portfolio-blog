import { zipStore } from './zip'

const SIG_LOCAL = 0x04034b50
const SIG_CD = 0x02014b50
const SIG_EOCD = 0x06054b50

const bytes = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff)
const decode = (b: Uint8Array) => String.fromCharCode(...b)

describe('zipStore', () => {
  it('packs files with local, central and end-of-directory records', () => {
    const out = zipStore([
      { name: 'a.txt', data: bytes('hello') },
      { name: 'b.txt', data: bytes('world!') },
    ])
    const view = new DataView(out.buffer)
    // starts with a local file header
    expect(view.getUint32(0, true)).toBe(SIG_LOCAL)

    // ends with the end-of-central-directory record (22 bytes)
    const eocd = new DataView(out.buffer, out.length - 22)
    expect(eocd.getUint32(0, true)).toBe(SIG_EOCD)
    expect(eocd.getUint16(10, true)).toBe(2) // total entries

    // a central-directory header exists somewhere in the middle
    let foundCd = false
    for (let i = 0; i <= out.length - 4; i++) {
      if (view.getUint32(i, true) === SIG_CD) {
        foundCd = true
        break
      }
    }
    expect(foundCd).toBe(true)

    // names and contents are embedded verbatim
    const text = decode(out)
    expect(text).toContain('a.txt')
    expect(text).toContain('b.txt')
    expect(text).toContain('hello')
    expect(text).toContain('world!')
  })

  it('writes the uncompressed size and a correct CRC32', () => {
    const out = zipStore([{ name: 'x', data: bytes('abc') }])
    const view = new DataView(out.buffer)
    expect(view.getUint32(22, true)).toBe(3) // uncompressed size of "abc"
    expect(view.getUint32(14, true) >>> 0).toBe(0x352441c2) // crc32("abc")
  })
})

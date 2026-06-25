/**
 * Minimal ZIP builder using the "store" method (no compression). Enough to pack
 * several files into a single downloadable archive.
 */

export interface ZipFile {
  /** Entry name inside the archive, e.g. "card.png". */
  name: string
  data: Uint8Array
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

/** Encode an entry name. Names here are slugified ASCII, so a byte map suffices. */
function encodeName(name: string): Uint8Array {
  const out = new Uint8Array(name.length)
  for (let i = 0; i < name.length; i++) out[i] = name.charCodeAt(i) & 0xff
  return out
}

/** Pack files into an uncompressed ZIP archive and return its bytes. */
export function zipStore(files: ZipFile[]): Uint8Array {
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = encodeName(file.name)
    const crc = crc32(file.data)
    const size = file.data.length

    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true) // local file header signature
    local.setUint16(4, 20, true) // version needed
    local.setUint16(6, 0, true) // flags
    local.setUint16(8, 0, true) // method 0 = store
    local.setUint16(10, 0, true) // mod time
    local.setUint16(12, 0, true) // mod date
    local.setUint32(14, crc, true)
    local.setUint32(18, size, true) // compressed size
    local.setUint32(22, size, true) // uncompressed size
    local.setUint16(26, nameBytes.length, true)
    local.setUint16(28, 0, true) // extra length
    const localBytes = new Uint8Array(local.buffer)
    parts.push(localBytes, nameBytes, file.data)

    const cd = new DataView(new ArrayBuffer(46))
    cd.setUint32(0, 0x02014b50, true) // central directory signature
    cd.setUint16(4, 20, true) // version made by
    cd.setUint16(6, 20, true) // version needed
    cd.setUint16(8, 0, true) // flags
    cd.setUint16(10, 0, true) // method
    cd.setUint16(12, 0, true) // time
    cd.setUint16(14, 0, true) // date
    cd.setUint32(16, crc, true)
    cd.setUint32(20, size, true)
    cd.setUint32(24, size, true)
    cd.setUint16(28, nameBytes.length, true)
    cd.setUint16(30, 0, true) // extra length
    cd.setUint16(32, 0, true) // comment length
    cd.setUint16(34, 0, true) // disk number
    cd.setUint16(36, 0, true) // internal attrs
    cd.setUint32(38, 0, true) // external attrs
    cd.setUint32(42, offset, true) // local header offset
    central.push(new Uint8Array(cd.buffer), nameBytes)

    offset += localBytes.length + nameBytes.length + size
  }

  let centralSize = 0
  for (const c of central) centralSize += c.length

  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true) // end of central directory signature
  end.setUint16(4, 0, true) // disk number
  end.setUint16(6, 0, true) // central dir start disk
  end.setUint16(8, files.length, true) // entries on this disk
  end.setUint16(10, files.length, true) // total entries
  end.setUint32(12, centralSize, true)
  end.setUint32(16, offset, true) // central dir offset
  end.setUint16(20, 0, true) // comment length

  const all = [...parts, ...central, new Uint8Array(end.buffer)]
  let total = 0
  for (const part of all) total += part.length
  const out = new Uint8Array(total)
  let pos = 0
  for (const part of all) {
    out.set(part, pos)
    pos += part.length
  }
  return out
}

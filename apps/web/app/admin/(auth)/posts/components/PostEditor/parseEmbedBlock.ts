export type EmbedType =
  | 'youtube'
  | 'youtube-360'
  | 'maps'
  | 'openstreetmap'
  | 'wikiloc'

export interface ParsedImage {
  url: string
  altText: string
  caption: string
  captionPos: 'top' | 'bottom'
  size: 'full' | 'small' | 'medium'
  align: 'none' | 'left' | 'right'
  expand: boolean
  photoMeta?: {
    iso?: string
    aperture?: string
    exposure?: string
    focalLength?: string
    panoramicCount?: string
  }
}

export interface ParsedEmbed {
  type: EmbedType
  url: string
}

export interface ParsedGpxTrack {
  url: string
  name: string
  color: string
  allowDownload: boolean
  showWaypoints: boolean
  showElevation: boolean
}

export interface ParsedGpx {
  tracks: ParsedGpxTrack[]
  mappingsByTrack: Record<number, Array<{ name: string; imageUrl: string }>>
}

export type ParsedSlideshowSlide = ParsedImage

export interface ParsedSlideshow {
  slides: ParsedSlideshowSlide[]
}

export type DetectedEmbed =
  | { type: 'image'; blockStart: number; blockEnd: number; parsed: ParsedImage }
  | { type: 'embed'; blockStart: number; blockEnd: number; parsed: ParsedEmbed }
  | { type: 'gpx'; blockStart: number; blockEnd: number; parsed: ParsedGpx }
  | {
      type: 'slideshow'
      blockStart: number
      blockEnd: number
      parsed: ParsedSlideshow
    }

const EMBED_TYPES: EmbedType[] = [
  'youtube',
  'youtube-360',
  'maps',
  'openstreetmap',
  'wikiloc',
]

function parseImageParams(params: string): Omit<ParsedImage, 'url'> {
  const result: Omit<ParsedImage, 'url'> = {
    altText: '',
    caption: '',
    captionPos: 'bottom',
    size: 'full',
    align: 'none',
    expand: false,
  }

  if (!params) return result

  let iso = ''
  let aperture = ''
  let exposure = ''
  let focalLength = ''
  let panoramicCount = ''
  let hasPhotoMeta = false

  for (const part of params.split('&')) {
    const eqIdx = part.indexOf('=')
    const key = eqIdx === -1 ? part : part.slice(0, eqIdx)
    const value = eqIdx === -1 ? '' : part.slice(eqIdx + 1)

    switch (key) {
      case 'size':
        if (value === 'small' || value === 'medium') result.size = value
        break
      case 'align':
        if (value === 'left' || value === 'right') result.align = value
        break
      case 'caption':
        result.caption = value
        break
      case 'caption-pos':
        if (value === 'top') result.captionPos = 'top'
        break
      case 'alt':
        result.altText = value
        break
      case 'expand':
        if (value === 'true') result.expand = true
        break
      case 'photo-iso':
        iso = value
        hasPhotoMeta = true
        break
      case 'photo-aperture':
        aperture = value
        hasPhotoMeta = true
        break
      case 'photo-exposure':
        exposure = value
        hasPhotoMeta = true
        break
      case 'photo-focal-length':
        focalLength = value
        hasPhotoMeta = true
        break
      case 'photo-panoramic-count':
        panoramicCount = value
        hasPhotoMeta = true
        break
    }
  }

  if (hasPhotoMeta)
    result.photoMeta = { iso, aperture, exposure, focalLength, panoramicCount }

  return result
}

function parseTrackLine(line: string): ParsedGpxTrack {
  const rest = line.slice('track:'.length)
  // Normalize multi-pipes to single separators with empty placeholder
  const normalized = rest
    .replace(/ \|\|\| /g, ' | <> | <> | ')
    .replace(/ \|\| /g, ' | <> | ')
  const parts = normalized.split(' | ')

  const url = parts[0] || ''
  const name = parts[1] === '<>' || parts[1] === undefined ? '' : parts[1]
  const color = parts[2] === '<>' || parts[2] === undefined ? '' : parts[2]
  const flagsStr = parts[3] === '<>' || parts[3] === undefined ? '' : parts[3]

  return {
    url,
    name,
    color,
    allowDownload: flagsStr.includes('download'),
    showWaypoints: flagsStr.includes('showWaypoints'),
    showElevation: flagsStr.includes('elevation'),
  }
}

export function parseGpxBody(
  body: string,
): Pick<ParsedGpx, 'tracks' | 'mappingsByTrack'> {
  const lines = body.split('\n').filter(Boolean)
  const tracks: ParsedGpxTrack[] = []
  const mappingsByTrack: Record<
    number,
    Array<{ name: string; imageUrl: string }>
  > = {}

  for (const line of lines) {
    if (line.startsWith('track:')) {
      tracks.push(parseTrackLine(line))
    } else {
      const m = line.match(/^(\d+):(.+)=(.+)$/)
      if (m) {
        const trackIdx = parseInt(m[1], 10)
        if (!mappingsByTrack[trackIdx]) mappingsByTrack[trackIdx] = []
        mappingsByTrack[trackIdx].push({ name: m[2], imageUrl: m[3] })
      }
    }
  }

  return { tracks, mappingsByTrack }
}

function adjustBounds(
  content: string,
  blockStart: number,
  blockEnd: number,
): { start: number; end: number } {
  const start = content.slice(0, blockStart).endsWith('\n\n')
    ? blockStart - 2
    : blockStart
  const end = content.slice(blockEnd).startsWith('\n\n')
    ? blockEnd + 2
    : blockEnd
  return { start, end }
}

export function detectEmbedAtCursor(
  content: string,
  pos: number,
): DetectedEmbed | null {
  let m: RegExpExecArray | null

  // Code fence blocks first: ```type\n...\n```
  // Must run before image check so that ![...](url) lines inside fences
  // are not mistakenly detected as standalone images.
  const fenceRe = /```([a-z0-9-]+)\n([\s\S]*?)```/g
  while ((m = fenceRe.exec(content)) !== null) {
    const { index } = m
    const blockEnd = index + m[0].length
    if (pos >= index && pos <= blockEnd) {
      const { start, end } = adjustBounds(content, index, blockEnd)
      const fenceType = m[1]
      const body = m[2].trim()

      if (fenceType === 'gpx') {
        const { tracks, mappingsByTrack } = parseGpxBody(body)
        return {
          type: 'gpx',
          blockStart: start,
          blockEnd: end,
          parsed: { tracks, mappingsByTrack },
        }
      }

      if (fenceType === 'slideshow') {
        const slideRe = /!\[([^\]]*)\]\(([^)]+)\)/g
        const slides: ParsedSlideshowSlide[] = []
        let sm: RegExpExecArray | null
        while ((sm = slideRe.exec(body)) !== null) {
          slides.push({ url: sm[2], ...parseImageParams(sm[1]) })
        }
        return {
          type: 'slideshow',
          blockStart: start,
          blockEnd: end,
          parsed: { slides },
        }
      }

      if ((EMBED_TYPES as string[]).includes(fenceType)) {
        return {
          type: 'embed',
          blockStart: start,
          blockEnd: end,
          parsed: { type: fenceType as EmbedType, url: body },
        }
      }
    }
  }

  // Standalone image blocks: ![params](url)
  const imageRe = /!\[([^\]]*)\]\(([^)]+)\)/g
  while ((m = imageRe.exec(content)) !== null) {
    const { index } = m
    const blockEnd = index + m[0].length
    if (pos >= index && pos <= blockEnd) {
      const { start, end } = adjustBounds(content, index, blockEnd)
      return {
        type: 'image',
        blockStart: start,
        blockEnd: end,
        parsed: { url: m[2], ...parseImageParams(m[1]) },
      }
    }
  }

  return null
}

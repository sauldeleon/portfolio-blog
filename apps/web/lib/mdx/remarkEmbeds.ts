import {
  parseCanyonWaypointsText,
  parseCroquisMeta,
  toCroquisObstacles,
} from '@web/lib/cards'

const EMBED_LANGS = [
  'youtube',
  'youtube-360',
  'maps',
  'wikiloc',
  'openstreetmap',
  'gpx',
]

export interface TrackDef {
  url: string
  name?: string
  color?: string
  allowDownload?: boolean
  showWaypoints?: boolean
  showElevation?: boolean
  waypointImages?: Record<string, string[]>
  waypointNotes?: Record<string, string[]>
}

function parseTrackLine(line: string): TrackDef {
  const raw = line.slice('track:'.length)
  const parts = raw.split('|').map((s) => s.trim())
  const flags = (parts[3] ?? '').split(/\s+/).filter(Boolean)
  return {
    url: parts[0],
    name: parts[1] || undefined,
    color: parts[2] || undefined,
    ...(flags.includes('download') ? { allowDownload: true } : {}),
    ...(flags.includes('showWaypoints') ? { showWaypoints: true } : {}),
    ...(flags.includes('elevation') ? { showElevation: true } : {}),
  }
}

export function remarkEmbeds() {
  return (tree: { children: unknown[] }) => {
    tree.children = tree.children.map((node) => {
      const n = node as {
        type: string
        lang?: string | null
        meta?: string | null
        value?: string
      }
      if (n.type !== 'code') return node

      if (n.lang === 'slideshow') {
        const lines = (n.value ?? '').trim().split('\n').filter(Boolean)
        const slides = lines
          .map((line) => {
            const m = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
            if (!m) return null
            return { src: m[2], alt: m[1] }
          })
          .filter(Boolean)
        return {
          type: 'mdxJsxFlowElement',
          name: 'Slideshow',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'slides',
              value: JSON.stringify(slides),
            },
          ],
          children: [],
        }
      }

      if (n.lang === 'croquis') {
        const obstacles = toCroquisObstacles(
          parseCanyonWaypointsText(n.value ?? ''),
        )
        const { title, showDownload } = parseCroquisMeta(n.meta ?? '')
        return {
          type: 'mdxJsxFlowElement',
          name: 'Croquis',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'obstacles',
              value: JSON.stringify(obstacles),
            },
            ...(title
              ? [{ type: 'mdxJsxAttribute', name: 'title', value: title }]
              : []),
            // Download button shows by default; flag its absence explicitly.
            ...(showDownload
              ? []
              : [{ type: 'mdxJsxAttribute', name: 'noDownload', value: null }]),
          ],
          children: [],
        }
      }

      if (!EMBED_LANGS.includes(n.lang ?? '')) return node

      const metaFlags = (n.meta ?? '').split(' ').filter(Boolean)
      const showWaypoints = metaFlags.includes('showWaypoints')
      const allowDownload = metaFlags.includes('allowDownload')

      const contentLines = (n.value ?? '').trim().split('\n')
      const trackLines = contentLines.filter((l) =>
        l.trim().startsWith('track:'),
      )
      const otherLines = contentLines.filter(
        (l) => !l.trim().startsWith('track:'),
      )

      const perTrackImages: Record<number, Record<string, string[]>> = {}
      const globalImages: Record<string, string[]> = {}
      const perTrackNotes: Record<number, Record<string, string[]>> = {}
      const globalNotes: Record<string, string[]> = {}

      otherLines.forEach((line) => {
        const eqIdx = line.indexOf('=')
        if (eqIdx <= 0) return
        const keyPart = line.slice(0, eqIdx).trim()
        // Value is `url1,url2 | note1 | note2`: comma-separated images, then
        // optional ` | `-separated description notes.
        const [urlsPart, ...noteParts] = line.slice(eqIdx + 1).split(' | ')
        const images = urlsPart
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean)
        const notes = noteParts.map((s) => s.trim()).filter(Boolean)
        if (images.length === 0 && notes.length === 0) return
        const colonIdx = keyPart.indexOf(':')
        if (colonIdx > 0 && /^\d+$/.test(keyPart.slice(0, colonIdx))) {
          const idx = parseInt(keyPart.slice(0, colonIdx), 10)
          const name = keyPart.slice(colonIdx + 1)
          if (images.length > 0) {
            if (!perTrackImages[idx]) perTrackImages[idx] = {}
            perTrackImages[idx][name] = images
          }
          if (notes.length > 0) {
            if (!perTrackNotes[idx]) perTrackNotes[idx] = {}
            perTrackNotes[idx][name] = notes
          }
        } else {
          if (images.length > 0) globalImages[keyPart] = images
          if (notes.length > 0) globalNotes[keyPart] = notes
        }
      })

      const hasGlobalImages = Object.keys(globalImages).length > 0
      const hasGlobalNotes = Object.keys(globalNotes).length > 0

      const commonAttrs = [
        ...(showWaypoints
          ? [{ type: 'mdxJsxAttribute', name: 'showWaypoints', value: null }]
          : []),
        ...(allowDownload
          ? [{ type: 'mdxJsxAttribute', name: 'allowDownload', value: null }]
          : []),
        ...(hasGlobalImages
          ? [
              {
                type: 'mdxJsxAttribute',
                name: 'waypointImages',
                value: JSON.stringify(globalImages),
              },
            ]
          : []),
        ...(hasGlobalNotes
          ? [
              {
                type: 'mdxJsxAttribute',
                name: 'waypointNotes',
                value: JSON.stringify(globalNotes),
              },
            ]
          : []),
      ]

      if (trackLines.length > 0) {
        const parsedTracks = trackLines.map(parseTrackLine)
        const tracks = parsedTracks.map((t, i) => ({
          ...t,
          ...(perTrackImages[i] ? { waypointImages: perTrackImages[i] } : {}),
          ...(perTrackNotes[i] ? { waypointNotes: perTrackNotes[i] } : {}),
        }))
        return {
          type: 'mdxJsxFlowElement',
          name: 'Embed',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'type', value: n.lang },
            {
              type: 'mdxJsxAttribute',
              name: 'tracks',
              value: JSON.stringify(tracks),
            },
            ...commonAttrs,
          ],
          children: [],
        }
      }

      const url = (otherLines[0] || '').trim()
      return {
        type: 'mdxJsxFlowElement',
        name: 'Embed',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'type', value: n.lang },
          { type: 'mdxJsxAttribute', name: 'url', value: url },
          ...commonAttrs,
        ],
        children: [],
      }
    })
  }
}

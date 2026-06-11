const EMBED_LANGS = ['youtube', 'maps', 'wikiloc', 'openstreetmap', 'gpx']

export interface TrackDef {
  url: string
  name?: string
  color?: string
  allowDownload?: boolean
  showWaypoints?: boolean
  showElevation?: boolean
  waypointImages?: Record<string, string>
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
      if (n.type !== 'code' || !EMBED_LANGS.includes(n.lang ?? '')) return node

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

      const perTrackImages: Record<number, Record<string, string>> = {}
      const globalImages: Record<string, string> = {}

      otherLines.forEach((line) => {
        const eqIdx = line.indexOf('=')
        if (eqIdx <= 0) return
        const keyPart = line.slice(0, eqIdx).trim()
        const value = line.slice(eqIdx + 1).trim()
        const colonIdx = keyPart.indexOf(':')
        if (colonIdx > 0 && /^\d+$/.test(keyPart.slice(0, colonIdx))) {
          const idx = parseInt(keyPart.slice(0, colonIdx), 10)
          const name = keyPart.slice(colonIdx + 1)
          if (!perTrackImages[idx]) perTrackImages[idx] = {}
          perTrackImages[idx][name] = value
        } else {
          globalImages[keyPart] = value
        }
      })

      const hasGlobalImages = Object.keys(globalImages).length > 0

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
      ]

      if (trackLines.length > 0) {
        const parsedTracks = trackLines.map(parseTrackLine)
        const tracks = parsedTracks.map((t, i) => ({
          ...t,
          ...(perTrackImages[i] ? { waypointImages: perTrackImages[i] } : {}),
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

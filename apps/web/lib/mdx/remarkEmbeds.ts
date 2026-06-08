const EMBED_LANGS = ['youtube', 'maps', 'wikiloc', 'openstreetmap', 'gpx']

export interface TrackDef {
  url: string
  name?: string
  color?: string
}

function parseTrackLine(line: string): TrackDef {
  const raw = line.slice('track:'.length)
  const parts = raw.split('|').map((s) => s.trim())
  return {
    url: parts[0],
    name: parts[1] || undefined,
    color: parts[2] || undefined,
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

      const waypointImages = otherLines.reduce<Record<string, string>>(
        (acc, line) => {
          const eqIdx = line.indexOf('=')
          if (eqIdx > 0) {
            acc[line.slice(0, eqIdx).trim()] = line.slice(eqIdx + 1).trim()
          }
          return acc
        },
        {},
      )
      const hasImages = Object.keys(waypointImages).length > 0

      const commonAttrs = [
        ...(showWaypoints
          ? [{ type: 'mdxJsxAttribute', name: 'showWaypoints', value: null }]
          : []),
        ...(allowDownload
          ? [{ type: 'mdxJsxAttribute', name: 'allowDownload', value: null }]
          : []),
        ...(hasImages
          ? [
              {
                type: 'mdxJsxAttribute',
                name: 'waypointImages',
                value: JSON.stringify(waypointImages),
              },
            ]
          : []),
      ]

      if (trackLines.length > 0) {
        const tracks = trackLines.map(parseTrackLine)
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

      const url = otherLines[0]?.trim() ?? ''
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

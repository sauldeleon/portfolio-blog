const EMBED_LANGS = ['youtube', 'maps', 'wikiloc', 'openstreetmap', 'gpx']

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
      const url = contentLines[0].trim()
      const waypointImages = contentLines
        .slice(1)
        .reduce<Record<string, string>>((acc, line) => {
          const eqIdx = line.indexOf('=')
          if (eqIdx > 0) {
            acc[line.slice(0, eqIdx).trim()] = line.slice(eqIdx + 1).trim()
          }
          return acc
        }, {})
      const hasImages = Object.keys(waypointImages).length > 0

      return {
        type: 'mdxJsxFlowElement',
        name: 'Embed',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'type', value: n.lang },
          { type: 'mdxJsxAttribute', name: 'url', value: url },
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
        ],
        children: [],
      }
    })
  }
}

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

      return {
        type: 'mdxJsxFlowElement',
        name: 'Embed',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'type', value: n.lang },
          {
            type: 'mdxJsxAttribute',
            name: 'url',
            value: n.value?.trim() ?? '',
          },
          ...(showWaypoints
            ? [{ type: 'mdxJsxAttribute', name: 'showWaypoints', value: null }]
            : []),
        ],
        children: [],
      }
    })
  }
}

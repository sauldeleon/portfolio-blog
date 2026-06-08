import { remarkEmbeds } from './remarkEmbeds'

type MdxNode = {
  type: string
  name?: string
  attributes?: Array<{ name: string; value: string }>
}

type CodeNode = {
  type: string
  lang?: string | null
  meta?: string | null
  value?: string
}

function runPlugin(nodes: CodeNode[]): MdxNode[] {
  const tree = { children: nodes as unknown[] }
  remarkEmbeds()(tree as { children: unknown[] })
  return tree.children as MdxNode[]
}

describe('remarkEmbeds', () => {
  it('transforms youtube code block into Embed element', () => {
    const [result] = runPlugin([
      { type: 'code', lang: 'youtube', value: 'https://youtube.com/abc' },
    ])
    expect(result.type).toBe('mdxJsxFlowElement')
    expect(result.name).toBe('Embed')
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'type',
      value: 'youtube',
    })
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'url',
      value: 'https://youtube.com/abc',
    })
  })

  it('transforms maps code block into Embed element', () => {
    const [result] = runPlugin([
      { type: 'code', lang: 'maps', value: 'https://maps.example.com' },
    ])
    expect(result.name).toBe('Embed')
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'type',
      value: 'maps',
    })
  })

  it('transforms wikiloc code block into Embed element', () => {
    const [result] = runPlugin([
      { type: 'code', lang: 'wikiloc', value: 'https://wikiloc.com/abc' },
    ])
    expect(result.name).toBe('Embed')
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'type',
      value: 'wikiloc',
    })
  })

  it('transforms openstreetmap code block into Embed element', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'openstreetmap',
        value: 'https://openstreetmap.org/abc',
      },
    ])
    expect(result.name).toBe('Embed')
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'type',
      value: 'openstreetmap',
    })
  })

  it('transforms gpx code block into Embed element', () => {
    const [result] = runPlugin([
      { type: 'code', lang: 'gpx', value: 'https://example.com/track.gpx' },
    ])
    expect(result.type).toBe('mdxJsxFlowElement')
    expect(result.name).toBe('Embed')
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'type',
      value: 'gpx',
    })
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'url',
      value: 'https://example.com/track.gpx',
    })
  })

  it('trims whitespace from url value', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        value: '  https://example.com/track.gpx  ',
      },
    ])
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'url',
      value: 'https://example.com/track.gpx',
    })
  })

  it('uses empty string when value is undefined', () => {
    const [result] = runPlugin([
      { type: 'code', lang: 'gpx', value: undefined },
    ])
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'url',
      value: '',
    })
  })

  it('does not transform non-embed code blocks', () => {
    const node = { type: 'code', lang: 'javascript', value: 'const x = 1' }
    const [result] = runPlugin([node])
    expect(result).toEqual(node)
  })

  it('does not transform non-code nodes', () => {
    const node = { type: 'paragraph', value: 'hello' }
    const [result] = runPlugin([node as CodeNode])
    expect(result).toEqual(node)
  })

  it('does not transform code block with null lang', () => {
    const node = { type: 'code', lang: null, value: 'hello' }
    const [result] = runPlugin([node])
    expect(result).toEqual(node)
  })

  it('preserves non-code nodes alongside embed nodes', () => {
    const results = runPlugin([
      { type: 'paragraph', value: 'intro' } as CodeNode,
      { type: 'code', lang: 'gpx', value: 'https://example.com/track.gpx' },
      { type: 'paragraph', value: 'outro' } as CodeNode,
    ])
    expect(results[0]).toEqual({ type: 'paragraph', value: 'intro' })
    expect(results[1].type).toBe('mdxJsxFlowElement')
    expect(results[2]).toEqual({ type: 'paragraph', value: 'outro' })
  })

  it('adds showWaypoints attribute when meta includes showWaypoints', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        meta: 'showWaypoints',
        value: 'https://example.com/track.gpx',
      },
    ])
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'showWaypoints',
      value: null,
    })
  })

  it('does not add showWaypoints attribute when meta is null', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        meta: null,
        value: 'https://example.com/track.gpx',
      },
    ])
    expect(result.attributes).not.toContainEqual(
      expect.objectContaining({ name: 'showWaypoints' }),
    )
  })

  it('does not add showWaypoints attribute when meta does not include showWaypoints', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        meta: 'someOtherFlag',
        value: 'https://example.com/track.gpx',
      },
    ])
    expect(result.attributes).not.toContainEqual(
      expect.objectContaining({ name: 'showWaypoints' }),
    )
  })

  it('adds allowDownload attribute when meta includes allowDownload', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        meta: 'allowDownload',
        value: 'https://example.com/track.gpx',
      },
    ])
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'allowDownload',
      value: null,
    })
  })

  it('does not add allowDownload attribute when meta is null', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        meta: null,
        value: 'https://example.com/track.gpx',
      },
    ])
    expect(result.attributes).not.toContainEqual(
      expect.objectContaining({ name: 'allowDownload' }),
    )
  })

  it('does not add allowDownload attribute when meta does not include allowDownload', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        meta: 'someOtherFlag',
        value: 'https://example.com/track.gpx',
      },
    ])
    expect(result.attributes).not.toContainEqual(
      expect.objectContaining({ name: 'allowDownload' }),
    )
  })

  it('uses first line as url when content has multiple lines', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        value: 'https://example.com/track.gpx\nSummit=https://cdn.com/img.jpg',
      },
    ])
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'url',
      value: 'https://example.com/track.gpx',
    })
  })

  it('adds waypointImages attribute when content has name=url lines', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        value:
          'https://example.com/track.gpx\nSummit=https://cdn.com/img1.jpg\nWater=https://cdn.com/img2.jpg',
      },
    ])
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'waypointImages',
      value: JSON.stringify({
        Summit: 'https://cdn.com/img1.jpg',
        Water: 'https://cdn.com/img2.jpg',
      }),
    })
  })

  it('does not add waypointImages attribute when no image lines present', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        value: 'https://example.com/track.gpx',
      },
    ])
    expect(result.attributes).not.toContainEqual(
      expect.objectContaining({ name: 'waypointImages' }),
    )
  })

  it('ignores lines without = when parsing waypoint images', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        value: 'https://example.com/track.gpx\nnot-an-image-line',
      },
    ])
    expect(result.attributes).not.toContainEqual(
      expect.objectContaining({ name: 'waypointImages' }),
    )
  })

  it('trims waypoint name and url in image lines', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        value:
          'https://example.com/track.gpx\n  Summit  =  https://cdn.com/img.jpg  ',
      },
    ])
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'waypointImages',
      value: JSON.stringify({ Summit: 'https://cdn.com/img.jpg' }),
    })
  })

  it('handles = inside image url correctly', () => {
    const [result] = runPlugin([
      {
        type: 'code',
        lang: 'gpx',
        value:
          'https://example.com/track.gpx\nSummit=https://cdn.com/img.jpg?w=800',
      },
    ])
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'waypointImages',
      value: JSON.stringify({ Summit: 'https://cdn.com/img.jpg?w=800' }),
    })
  })

  describe('multi-track format', () => {
    it('emits tracks attribute when track: lines present', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value:
            'track:https://cdn.com/t1.gpx | Outbound | #e63946\ntrack:https://cdn.com/t2.gpx | Return | #3a86ff',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([
          { url: 'https://cdn.com/t1.gpx', name: 'Outbound', color: '#e63946' },
          { url: 'https://cdn.com/t2.gpx', name: 'Return', color: '#3a86ff' },
        ]),
      })
    })

    it('does not emit url attribute when track: lines present', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value: 'track:https://cdn.com/t1.gpx',
        },
      ])
      expect(result.attributes).not.toContainEqual(
        expect.objectContaining({ name: 'url' }),
      )
    })

    it('parses track with only url (no name or color)', () => {
      const [result] = runPlugin([
        { type: 'code', lang: 'gpx', value: 'track:https://cdn.com/t1.gpx' },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([{ url: 'https://cdn.com/t1.gpx' }]),
      })
    })

    it('parses track with url and name but no color', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value: 'track:https://cdn.com/t1.gpx | Outbound',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([
          { url: 'https://cdn.com/t1.gpx', name: 'Outbound' },
        ]),
      })
    })

    it('parses track with url and color but no name (empty middle segment)', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value: 'track:https://cdn.com/t1.gpx || #e63946',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([
          { url: 'https://cdn.com/t1.gpx', color: '#e63946' },
        ]),
      })
    })

    it('includes waypointImages alongside tracks when image lines present', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value:
            'track:https://cdn.com/t1.gpx | Outbound | #e63946\nSummit=https://cdn.com/img.jpg',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([
          { url: 'https://cdn.com/t1.gpx', name: 'Outbound', color: '#e63946' },
        ]),
      })
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'waypointImages',
        value: JSON.stringify({ Summit: 'https://cdn.com/img.jpg' }),
      })
    })

    it('includes showWaypoints and allowDownload flags with tracks', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          meta: 'showWaypoints allowDownload',
          value:
            'track:https://cdn.com/t1.gpx | Outbound | #e63946\ntrack:https://cdn.com/t2.gpx | Return | #3a86ff',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'showWaypoints',
        value: null,
      })
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'allowDownload',
        value: null,
      })
    })

    it('parses | download segment as per-track allowDownload', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value:
            'track:https://cdn.com/t1.gpx | T1 | #e63946 | download\ntrack:https://cdn.com/t2.gpx | T2',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([
          {
            url: 'https://cdn.com/t1.gpx',
            name: 'T1',
            color: '#e63946',
            allowDownload: true,
          },
          { url: 'https://cdn.com/t2.gpx', name: 'T2' },
        ]),
      })
    })

    it('parses showWaypoints flag in track line as per-track showWaypoints', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value:
            'track:https://cdn.com/t1.gpx | T1 | #e63946 | showWaypoints\ntrack:https://cdn.com/t2.gpx | T2',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([
          {
            url: 'https://cdn.com/t1.gpx',
            name: 'T1',
            color: '#e63946',
            showWaypoints: true,
          },
          { url: 'https://cdn.com/t2.gpx', name: 'T2' },
        ]),
      })
    })

    it('parses both download and showWaypoints flags in track line', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value: 'track:https://cdn.com/t1.gpx ||| download showWaypoints',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([
          {
            url: 'https://cdn.com/t1.gpx',
            allowDownload: true,
            showWaypoints: true,
          },
        ]),
      })
    })

    it('parses per-track image lines with numeric prefix into track waypointImages', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value:
            'track:https://cdn.com/t1.gpx | T1\ntrack:https://cdn.com/t2.gpx | T2\n0:Summit=https://cdn.com/img1.jpg\n1:Lake=https://cdn.com/img2.jpg',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([
          {
            url: 'https://cdn.com/t1.gpx',
            name: 'T1',
            waypointImages: { Summit: 'https://cdn.com/img1.jpg' },
          },
          {
            url: 'https://cdn.com/t2.gpx',
            name: 'T2',
            waypointImages: { Lake: 'https://cdn.com/img2.jpg' },
          },
        ]),
      })
      expect(result.attributes).not.toContainEqual(
        expect.objectContaining({ name: 'waypointImages' }),
      )
    })

    it('keeps legacy image lines (no prefix) as global waypointImages', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value:
            'track:https://cdn.com/t1.gpx | T1\nSummit=https://cdn.com/img.jpg',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([{ url: 'https://cdn.com/t1.gpx', name: 'T1' }]),
      })
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'waypointImages',
        value: JSON.stringify({ Summit: 'https://cdn.com/img.jpg' }),
      })
    })

    it('trims whitespace from track url, name and color', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value: 'track:  https://cdn.com/t1.gpx  |  Outbound  |  #e63946  ',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([
          { url: 'https://cdn.com/t1.gpx', name: 'Outbound', color: '#e63946' },
        ]),
      })
    })

    it('merges multiple per-track image lines for the same track index', () => {
      const [result] = runPlugin([
        {
          type: 'code',
          lang: 'gpx',
          value:
            'track:https://cdn.com/t1.gpx\n0:Summit=https://cdn.com/img1.jpg\n0:Lake=https://cdn.com/img2.jpg',
        },
      ])
      expect(result.attributes).toContainEqual({
        type: 'mdxJsxAttribute',
        name: 'tracks',
        value: JSON.stringify([
          {
            url: 'https://cdn.com/t1.gpx',
            waypointImages: {
              Summit: 'https://cdn.com/img1.jpg',
              Lake: 'https://cdn.com/img2.jpg',
            },
          },
        ]),
      })
    })
  })

  it('uses empty string for url when non-track gpx block has empty content', () => {
    const [result] = runPlugin([{ type: 'code', lang: 'gpx', value: '' }])
    expect(result.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'url',
      value: '',
    })
  })
})

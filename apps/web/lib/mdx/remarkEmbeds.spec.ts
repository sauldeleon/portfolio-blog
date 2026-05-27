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
})

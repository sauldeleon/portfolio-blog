import { remarkEmbeds } from './remarkEmbeds'

function makeTree(children: unknown[]) {
  return { children }
}

function makeCodeNode(lang: string | null | undefined, value?: string) {
  return { type: 'code', lang, value }
}

describe('remarkEmbeds', () => {
  it('transforms youtube code block into mdxJsxFlowElement', () => {
    const transformer = remarkEmbeds()
    const tree = makeTree([makeCodeNode('youtube', '  https://youtu.be/abc  ')])
    transformer(tree)

    expect(tree.children[0]).toEqual({
      type: 'mdxJsxFlowElement',
      name: 'Embed',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'type', value: 'youtube' },
        {
          type: 'mdxJsxAttribute',
          name: 'url',
          value: 'https://youtu.be/abc',
        },
      ],
      children: [],
    })
  })

  it('transforms maps code block', () => {
    const transformer = remarkEmbeds()
    const tree = makeTree([makeCodeNode('maps', 'https://maps.example.com')])
    transformer(tree)

    const node = tree.children[0] as {
      name: string
      attributes: { value: unknown }[]
    }
    expect(node.name).toBe('Embed')
    expect(node.attributes[0].value).toBe('maps')
    expect(node.attributes[1].value).toBe('https://maps.example.com')
  })

  it('transforms wikiloc code block', () => {
    const transformer = remarkEmbeds()
    const tree = makeTree([
      makeCodeNode('wikiloc', 'https://wikiloc.example.com'),
    ])
    transformer(tree)

    const node = tree.children[0] as {
      name: string
      attributes: { value: unknown }[]
    }
    expect(node.name).toBe('Embed')
    expect(node.attributes[0].value).toBe('wikiloc')
  })

  it('transforms openstreetmap code block', () => {
    const transformer = remarkEmbeds()
    const tree = makeTree([
      makeCodeNode('openstreetmap', 'https://osm.example.com'),
    ])
    transformer(tree)

    const node = tree.children[0] as {
      name: string
      attributes: { value: unknown }[]
    }
    expect(node.name).toBe('Embed')
    expect(node.attributes[0].value).toBe('openstreetmap')
  })

  it('does NOT transform typescript code blocks', () => {
    const transformer = remarkEmbeds()
    const original = makeCodeNode('typescript', 'const x = 1')
    const tree = makeTree([original])
    transformer(tree)

    expect(tree.children[0]).toBe(original)
  })

  it('does NOT transform plain code blocks (no lang)', () => {
    const transformer = remarkEmbeds()
    const original = makeCodeNode('text', 'hello')
    const tree = makeTree([original])
    transformer(tree)

    expect(tree.children[0]).toBe(original)
  })

  it('does NOT transform non-code nodes', () => {
    const transformer = remarkEmbeds()
    const paragraph = {
      type: 'paragraph',
      children: [{ type: 'text', value: 'Hello' }],
    }
    const tree = makeTree([paragraph])
    transformer(tree)

    expect(tree.children[0]).toBe(paragraph)
  })

  it('handles node with null lang — returns as-is', () => {
    const transformer = remarkEmbeds()
    const original = makeCodeNode(null, 'some code')
    const tree = makeTree([original])
    transformer(tree)

    expect(tree.children[0]).toBe(original)
  })

  it('handles node with undefined lang — returns as-is', () => {
    const transformer = remarkEmbeds()
    const original = makeCodeNode(undefined, 'some code')
    const tree = makeTree([original])
    transformer(tree)

    expect(tree.children[0]).toBe(original)
  })

  it('trims whitespace from value', () => {
    const transformer = remarkEmbeds()
    const tree = makeTree([makeCodeNode('youtube', '  dQw4w9WgXcQ  \n')])
    transformer(tree)

    const node = tree.children[0] as { attributes: { value: unknown }[] }
    expect(node.attributes[1].value).toBe('dQw4w9WgXcQ')
  })

  it('handles node with no value property — uses empty string', () => {
    const transformer = remarkEmbeds()
    const node = { type: 'code', lang: 'youtube' }
    const tree = makeTree([node])
    transformer(tree)

    const result = tree.children[0] as { attributes: { value: unknown }[] }
    expect(result.attributes[1].value).toBe('')
  })
})

import type { Element, Root } from 'hast'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import { rehypeHeadingIds } from './rehypeHeadingIds'

function processMarkdown(md: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeHeadingIds)

  return processor.runSync(processor.parse(md))
}

function getHeadingIds(
  tree: ReturnType<typeof processMarkdown>,
): Record<string, string | undefined> {
  const ids: Record<string, string | undefined> = {}
  const { visit } = require('unist-util-visit')
  visit(
    tree,
    'element',
    (node: { tagName: string; properties?: Record<string, unknown> }) => {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) {
        ids[node.tagName] = node.properties?.['id'] as string | undefined
      }
    },
  )
  return ids
}

describe('rehypeHeadingIds', () => {
  it('adds id to h2 heading', () => {
    const tree = processMarkdown('## Hello World')
    const ids = getHeadingIds(tree)
    expect(ids['h2']).toBe('hello-world')
  })

  it('adds id to h3 heading', () => {
    const tree = processMarkdown('### Sub Section')
    const ids = getHeadingIds(tree)
    expect(ids['h3']).toBe('sub-section')
  })

  it('adds id to h4 heading', () => {
    const tree = processMarkdown('#### Deep Section')
    const ids = getHeadingIds(tree)
    expect(ids['h4']).toBe('deep-section')
  })

  it('does not add id to h1', () => {
    const tree = processMarkdown('# Title')
    const ids = getHeadingIds(tree)
    expect(ids['h1']).toBeUndefined()
  })

  it('does not add id to h5 or h6', () => {
    const tree = processMarkdown('##### Five\n\n###### Six')
    const ids = getHeadingIds(tree)
    expect(ids['h5']).toBeUndefined()
    expect(ids['h6']).toBeUndefined()
  })

  it('does not add id when heading has no text', () => {
    const tree = processMarkdown('## \n\n## Valid')
    const ids = getHeadingIds(tree)
    expect(ids['h2']).toBe('valid')
  })

  it('handles heading node without properties object', () => {
    const tree: Root = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'h2',
          properties: undefined as unknown as Record<string, unknown>,
          children: [{ type: 'text', value: 'No Props' }],
        } as Element,
      ],
    }
    unified().use(rehypeHeadingIds).runSync(tree)
    const heading = tree.children[0] as Element
    expect(heading.properties?.['id']).toBe('no-props')
  })
})

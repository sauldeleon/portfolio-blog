import type { Element, Root } from 'hast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

import { slugifyHeading } from './remarkHeadings'

const HEADING_TAGS = new Set(['h2', 'h3', 'h4'])

function extractTextFromElement(node: Element): string {
  const parts: string[] = []
  visit(node, 'text', (textNode: { type: 'text'; value: string }) => {
    parts.push(textNode.value)
  })
  return parts.join('')
}

export const rehypeHeadingIds: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element) => {
    if (!HEADING_TAGS.has(node.tagName)) return
    const text = extractTextFromElement(node)
    if (!text) return
    node.properties = node.properties ?? {}
    node.properties['id'] = slugifyHeading(text)
  })
}

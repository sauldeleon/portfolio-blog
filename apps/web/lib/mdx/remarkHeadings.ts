import type { Heading, Root, Text } from 'mdast'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

export interface TocEntry {
  depth: number
  text: string
  id: string
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractText(node: Heading): string {
  const parts: string[] = []
  visit(node, 'text', (textNode: Text) => {
    parts.push(textNode.value)
  })
  return parts.join('')
}

export function extractToc(source: string): TocEntry[] {
  const tree = unified().use(remarkParse).parse(source) as Root
  const entries: TocEntry[] = []

  visit(tree, 'heading', (node: Heading) => {
    if (node.depth < 2 || node.depth > 4) return
    const text = extractText(node)
    if (!text) return
    entries.push({ depth: node.depth, text, id: slugifyHeading(text) })
  })

  return entries
}

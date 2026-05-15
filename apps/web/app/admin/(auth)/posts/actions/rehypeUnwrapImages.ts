import type { Element, Root } from 'hast'
import type { Plugin } from 'unified'

export const rehypeUnwrapImages: Plugin<[], Root> = () => (tree) => {
  tree.children = tree.children.flatMap((child) => {
    if (child.type !== 'element') return [child]
    const el = child as Element
    if (el.tagName !== 'p') return [el]
    const imgs = el.children.filter(
      (c) => c.type === 'element' && (c as Element).tagName === 'img',
    )
    if (imgs.length === 0) return [el]
    const hasNonImgContent = el.children.some(
      (c) =>
        !(c.type === 'element' && (c as Element).tagName === 'img') &&
        !(
          c.type === 'text' &&
          /^\s*$/.test((c as { type: 'text'; value: string }).value)
        ),
    )
    if (hasNonImgContent) return [el]
    return imgs as Root['children']
  }) as Root['children']
}

import type { Element, Root, Text } from 'hast'

import { rehypeUnwrapImages } from './rehypeUnwrapImages'

function makeTree(children: Root['children']): Root {
  return { type: 'root', children }
}

function el(tagName: string, children: Element['children'] = []): Element {
  return { type: 'element', tagName, properties: {}, children }
}

function p(...children: Element['children']): Element {
  return el('p', children)
}

function img(): Element {
  return el('img')
}

function span(): Element {
  return el('span')
}

function text(value: string): Text {
  return { type: 'text', value }
}

function whitespace(): Text {
  return text('\n')
}

describe('rehypeUnwrapImages', () => {
  let transform: (tree: Root) => void

  beforeEach(() => {
    transform = rehypeUnwrapImages() as (tree: Root) => void
  })

  it('unwraps <p> containing only <img>', () => {
    const tree = makeTree([p(img())])
    transform(tree)
    expect(tree.children).toHaveLength(1)
    expect((tree.children[0] as Element).tagName).toBe('img')
  })

  it('unwraps <p> with <img> and surrounding whitespace', () => {
    const tree = makeTree([p(whitespace(), img(), whitespace())])
    transform(tree)
    expect(tree.children).toHaveLength(1)
    expect((tree.children[0] as Element).tagName).toBe('img')
  })

  it('unwraps <p> with multiple imgs', () => {
    const tree = makeTree([p(img(), whitespace(), img())])
    transform(tree)
    expect(tree.children).toHaveLength(2)
    tree.children.forEach((c) => expect((c as Element).tagName).toBe('img'))
  })

  it('does not unwrap <p> containing text alongside img', () => {
    const tree = makeTree([p(text('caption'), img())])
    transform(tree)
    expect((tree.children[0] as Element).tagName).toBe('p')
  })

  it('does not unwrap <p> with no img elements', () => {
    const tree = makeTree([p(text('just text'))])
    transform(tree)
    expect((tree.children[0] as Element).tagName).toBe('p')
  })

  it('does not unwrap <p> containing non-img elements', () => {
    const tree = makeTree([p(span())])
    transform(tree)
    expect((tree.children[0] as Element).tagName).toBe('p')
  })

  it('does not unwrap <p> with only whitespace (no img)', () => {
    const tree = makeTree([p(whitespace())])
    transform(tree)
    expect((tree.children[0] as Element).tagName).toBe('p')
  })

  it('leaves non-p root elements untouched', () => {
    const tree = makeTree([img()])
    transform(tree)
    expect((tree.children[0] as Element).tagName).toBe('img')
  })

  it('leaves non-element root nodes untouched', () => {
    const tree = makeTree([
      text('root text') as unknown as Root['children'][number],
    ])
    transform(tree)
    expect((tree.children[0] as Text).value).toBe('root text')
  })
})

import { extractToc, slugifyHeading } from './remarkHeadings'

describe('slugifyHeading', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugifyHeading('Hello World')).toBe('hello-world')
  })

  it('removes non-word characters', () => {
    expect(slugifyHeading('Hello, World!')).toBe('hello-world')
  })

  it('trims whitespace before slugifying', () => {
    expect(slugifyHeading('  Hello World  ')).toBe('hello-world')
  })

  it('collapses multiple spaces', () => {
    expect(slugifyHeading('Hello   World')).toBe('hello-world')
  })

  it('preserves hyphens', () => {
    expect(slugifyHeading('Hello-World')).toBe('hello-world')
  })
})

describe('extractToc', () => {
  it('returns empty array for source with no headings', () => {
    expect(extractToc('Just some paragraph text.')).toEqual([])
  })

  it('extracts h2 headings', () => {
    const source = '## Introduction\n\nSome text.'
    expect(extractToc(source)).toEqual([
      { depth: 2, text: 'Introduction', id: 'introduction' },
    ])
  })

  it('extracts h3 and h4 headings', () => {
    const source = '### Sub Section\n\n#### Deep Section'
    expect(extractToc(source)).toEqual([
      { depth: 3, text: 'Sub Section', id: 'sub-section' },
      { depth: 4, text: 'Deep Section', id: 'deep-section' },
    ])
  })

  it('ignores h1 headings', () => {
    const source = '# Title\n\n## Section'
    expect(extractToc(source)).toEqual([
      { depth: 2, text: 'Section', id: 'section' },
    ])
  })

  it('ignores h5 and h6 headings', () => {
    const source = '##### Too Deep\n\n###### Also Too Deep\n\n## Valid'
    expect(extractToc(source)).toEqual([
      { depth: 2, text: 'Valid', id: 'valid' },
    ])
  })

  it('handles multiple headings at different depths', () => {
    const source = `## First\n\n### First Sub\n\n## Second\n\n#### Deep`
    expect(extractToc(source)).toEqual([
      { depth: 2, text: 'First', id: 'first' },
      { depth: 3, text: 'First Sub', id: 'first-sub' },
      { depth: 2, text: 'Second', id: 'second' },
      { depth: 4, text: 'Deep', id: 'deep' },
    ])
  })

  it('skips headings with no text content', () => {
    const source = '## \n\n## Real Heading'
    const result = extractToc(source)
    expect(result).toEqual([
      { depth: 2, text: 'Real Heading', id: 'real-heading' },
    ])
  })
})

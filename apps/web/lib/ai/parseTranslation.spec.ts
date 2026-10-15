import { parseTranslation } from './parseTranslation'

describe('parseTranslation', () => {
  it('returns nothing before any field arrives', () => {
    expect(parseTranslation('<tit')).toEqual({})
  })

  it('reads a complete reply', () => {
    expect(
      parseTranslation(
        '<title> Title </title>\n<excerpt>Short</excerpt>\n<content>\n## Hi\n\ntext\n</content>',
      ),
    ).toEqual({ title: 'Title', excerpt: 'Short', content: '## Hi\n\ntext' })
  })

  it('grows the content while streaming, hiding a partial closing tag', () => {
    const head = '<title>T</title><excerpt>E</excerpt><content>\n'
    expect(parseTranslation(head + 'Some te')).toEqual({
      title: 'T',
      excerpt: 'E',
      content: 'Some te',
    })
    expect(parseTranslation(head + 'Done\n</cont').content).toBe('Done')
    expect(parseTranslation(head + 'a < b').content).toBe('a < b')
  })
})

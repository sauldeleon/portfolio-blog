import { type FormatAction, applyFormat } from './markdownFormat'

function format(action: FormatAction, text: string) {
  // `[` and `]` mark the selection in `text`.
  const start = text.indexOf('[')
  const end = text.indexOf(']') - 1
  const content = text.replace('[', '').replace(']', '')
  const result = applyFormat(action, content, start, end)
  return (
    result.content.slice(0, result.selectionStart) +
    '[' +
    result.content.slice(result.selectionStart, result.selectionEnd) +
    ']' +
    result.content.slice(result.selectionEnd)
  )
}

describe('applyFormat', () => {
  it('wraps the selection inline', () => {
    expect(format('bold', 'a [word] b')).toBe('a **[word]** b')
    expect(format('italic', 'a [word] b')).toBe('a _[word]_ b')
    expect(format('strike', '[x]')).toBe('~~[x]~~')
    expect(format('code', '[x]')).toBe('`[x]`')
  })

  it('inserts a placeholder without selection', () => {
    expect(format('bold', 'a []')).toBe('a **[bold text]**')
  })

  it('unwraps an already wrapped selection', () => {
    expect(format('bold', 'a **[word]** b')).toBe('a [word] b')
  })

  it('formats whole lines', () => {
    expect(format('h2', 'x\nTi[t]le\ny')).toBe('x\n[## Title]\ny')
    expect(format('h3', '## [Title]')).toBe('[### Title]')
    expect(format('quote', '[one\ntwo]')).toBe('[> one\n> two]')
    expect(format('ul', '[1. one\n\n2. two]')).toBe('[- one\n\n- two]')
    expect(format('ol', '[one\ntwo]')).toBe('[1. one\n2. two]')
  })

  it('prefixes an empty line', () => {
    expect(format('ul', '[]')).toBe('[- ]')
  })

  it('toggles a line format off', () => {
    expect(format('h2', '[## Title]')).toBe('[Title]')
    expect(format('ul', '[- one\n- two]')).toBe('[one\ntwo]')
  })

  it('wraps a code block on its own lines', () => {
    expect(format('codeBlock', 'a [x] b')).toBe('a \n```\n[x]\n```\n b')
    expect(format('codeBlock', '[]\nb')).toBe('```\n[code]\n```\nb')
  })

  it('adds a horizontal rule after the selection', () => {
    expect(format('hr', 'a [b]')).toBe('a b\n\n---\n[]\n')
    expect(format('hr', '[]')).toBe('\n---\n[]\n')
  })
})

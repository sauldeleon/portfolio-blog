export type FormatAction =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'h2'
  | 'h3'
  | 'ul'
  | 'ol'
  | 'quote'
  | 'code'
  | 'codeBlock'
  | 'hr'

export interface FormatResult {
  content: string
  selectionStart: number
  selectionEnd: number
}

const INLINE: Partial<Record<FormatAction, [string, string]>> = {
  bold: ['**', 'bold text'],
  italic: ['_', 'italic text'],
  strike: ['~~', 'struck text'],
  code: ['`', 'code'],
}

interface LineFormat {
  /** Lines already in this format. */
  match: RegExp
  /** Markers of related formats, replaced instead of stacked. */
  replace: RegExp
  prefix: (index: number) => string
}

const HEADING = /^#{1,6}\s+/
const LIST = /^(\d+\.|[-*+])\s+/

const LINES: Partial<Record<FormatAction, LineFormat>> = {
  h2: { match: /^##\s+/, replace: HEADING, prefix: () => '## ' },
  h3: { match: /^###\s+/, replace: HEADING, prefix: () => '### ' },
  ul: { match: /^[-*+]\s+/, replace: LIST, prefix: () => '- ' },
  ol: { match: /^\d+\.\s+/, replace: LIST, prefix: (i) => `${i + 1}. ` },
  quote: { match: /^>\s?/, replace: /^>\s?/, prefix: () => '> ' },
}

/** Wraps the selection in `marker`, or unwraps it when already wrapped. */
function wrap(
  content: string,
  start: number,
  end: number,
  marker: string,
  placeholder: string,
): FormatResult {
  const before = content.slice(0, start)
  const after = content.slice(end)
  if (start !== end && before.endsWith(marker) && after.startsWith(marker)) {
    return {
      content:
        before.slice(0, -marker.length) +
        content.slice(start, end) +
        after.slice(marker.length),
      selectionStart: start - marker.length,
      selectionEnd: end - marker.length,
    }
  }
  const text = content.slice(start, end) || placeholder
  return {
    content: before + marker + text + marker + after,
    selectionStart: start + marker.length,
    selectionEnd: start + marker.length + text.length,
  }
}

/** Prefixes every selected line, or removes the prefix when all have it. */
function prefixLines(
  content: string,
  start: number,
  end: number,
  format: LineFormat,
): FormatResult {
  const lineStart = content.lastIndexOf('\n', start - 1) + 1
  const nextBreak = content.indexOf('\n', end)
  const lineEnd = nextBreak === -1 ? content.length : nextBreak
  const lines = content.slice(lineStart, lineEnd).split('\n')
  const filled = lines.filter((line) => line.trim() !== '')
  const toggleOff =
    filled.length > 0 && filled.every((line) => format.match.test(line))
  const block = lines
    .map((line, i) => {
      if (toggleOff) return line.replace(format.match, '')
      if (line.trim() === '' && lines.length > 1) return line
      return format.prefix(i) + line.replace(format.replace, '')
    })
    .join('\n')
  return {
    content: content.slice(0, lineStart) + block + content.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + block.length,
  }
}

/** Inserts `block` on lines of its own, separated from the text around it. */
function insertBlock(
  content: string,
  start: number,
  end: number,
  block: string,
  selectFrom: number,
  selectLength: number,
): FormatResult {
  const before = content.slice(0, start)
  const after = content.slice(end)
  const lead = before === '' || before.endsWith('\n') ? '' : '\n'
  const tail = after.startsWith('\n') ? '' : '\n'
  const offset = before.length + lead.length + selectFrom
  return {
    content: before + lead + block + tail + after,
    selectionStart: offset,
    selectionEnd: offset + selectLength,
  }
}

/**
 * Applies a toolbar action to `content` with the textarea selection
 * `start`–`end`, returning the new content and the selection to restore.
 */
export function applyFormat(
  action: FormatAction,
  content: string,
  start: number,
  end: number,
): FormatResult {
  const inline = INLINE[action]
  if (inline) return wrap(content, start, end, inline[0], inline[1])
  const line = LINES[action]
  if (line) return prefixLines(content, start, end, line)
  if (action === 'codeBlock') {
    const code = content.slice(start, end) || 'code'
    return insertBlock(
      content,
      start,
      end,
      '```\n' + code + '\n```',
      4,
      code.length,
    )
  }
  // Horizontal rule after the selection, with the cursor past it.
  return insertBlock(content, end, end, '\n---\n', 5, 0)
}

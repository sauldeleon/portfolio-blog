export interface PostFields {
  title: string
  excerpt: string
  content: string
}

const CLOSE_CONTENT = '</content>'

/** Drops the start of a closing tag that has only partly arrived. */
function trimPartialClose(text: string): string {
  for (let k = CLOSE_CONTENT.length - 1; k > 0; k--) {
    if (text.endsWith(CLOSE_CONTENT.slice(0, k))) return text.slice(0, -k)
  }
  return text
}

/**
 * Reads the fields out of a (possibly still streaming) model reply. Missing
 * fields are undefined; the content grows as it arrives.
 */
export function parseTranslation(raw: string): Partial<PostFields> {
  const result: Partial<PostFields> = {}
  const title = /<title>([\s\S]*?)<\/title>/.exec(raw)
  if (title) result.title = title[1].trim()
  const excerpt = /<excerpt>([\s\S]*?)<\/excerpt>/.exec(raw)
  if (excerpt) result.excerpt = excerpt[1].trim()
  const start = raw.indexOf('<content>')
  if (start !== -1) {
    const body = raw.slice(start + '<content>'.length).replace(/^\n/, '')
    const end = body.lastIndexOf(CLOSE_CONTENT)
    result.content = (
      end === -1 ? trimPartialClose(body) : body.slice(0, end)
    ).replace(/\n$/, '')
  }
  return result
}

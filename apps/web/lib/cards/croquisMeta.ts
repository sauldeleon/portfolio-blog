/**
 * The croquis fenced-block info string (after ```croquis) carries an optional
 * title plus flags. Currently the only flag is `no-download`, which hides the
 * PNG download button in the rendered post (shown by default).
 *
 * Format: `[no-download] <title…>` — leading flag tokens, then the free-text
 * title. Parsing and serialising live here so the reader (remark, editor
 * detector) and the writer (insert modal) never drift.
 */
export interface CroquisMeta {
  title: string
  showDownload: boolean
}

const NO_DOWNLOAD_FLAG = 'no-download'

export function parseCroquisMeta(meta: string): CroquisMeta {
  const tokens = meta.trim().split(/\s+/).filter(Boolean)
  let showDownload = true
  if (tokens[0] === NO_DOWNLOAD_FLAG) {
    showDownload = false
    tokens.shift()
  }
  return { title: tokens.join(' '), showDownload }
}

export function serializeCroquisMeta({
  title,
  showDownload,
}: CroquisMeta): string {
  const parts: string[] = []
  if (!showDownload) parts.push(NO_DOWNLOAD_FLAG)
  const trimmed = title.trim()
  if (trimmed) parts.push(trimmed)
  return parts.join(' ')
}

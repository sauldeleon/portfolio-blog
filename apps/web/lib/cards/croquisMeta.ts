import { parseCanyonSummary } from './canyonSummaryData'
import type { CanyoningCardData } from './types'

/**
 * The croquis fenced-block info string (after ```croquis) carries an optional
 * title plus flags:
 * - `no-download` hides the PNG download button (shown by default).
 * - `no-report` hides the "canyon report" PDF button (shown by default).
 * - `canyon:<base64>` carries the canyon-summary data used by the PDF report
 *   (base64 so it survives the whitespace-tokenised info string; the waypoint
 *   body is owned end-to-end by the waypoint parser and cannot hold it).
 *
 * Format: `[flags…] [canyon:…] <title…>` — leading flag/token entries, then the
 * free-text title. Parsing and serialising live here so the reader (remark,
 * editor detector) and the writer (insert modal) never drift.
 */
export interface CroquisMeta {
  title: string
  showDownload: boolean
  showReport: boolean
  /** Canyon-summary data for the PDF report; null when absent/invalid. */
  canyon: CanyoningCardData | null
}

const NO_DOWNLOAD_FLAG = 'no-download'
const NO_REPORT_FLAG = 'no-report'
const CANYON_PREFIX = 'canyon:'

/**
 * UTF-8-safe base64 built on `btoa`/`atob` + `encodeURIComponent` — available
 * in the browser, Node and the jsdom test env alike (unlike `TextEncoder`,
 * which jsdom does not expose).
 */
function toBase64(input: string): string {
  const binary = encodeURIComponent(input).replace(
    /%([0-9A-F]{2})/g,
    (_, hex) => String.fromCharCode(parseInt(hex, 16)),
  )
  return btoa(binary)
}

function fromBase64(input: string): string {
  const percent = atob(input)
    .split('')
    .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
    .join('')
  return decodeURIComponent(percent)
}

/** Encode canyon-summary data into the `canyon:` meta token payload. */
export function encodeCanyonToken(data: CanyoningCardData): string {
  return toBase64(JSON.stringify(data))
}

/** Decode a `canyon:` token payload back into card data; null when invalid. */
export function decodeCanyonToken(token: string): CanyoningCardData | null {
  try {
    return parseCanyonSummary(fromBase64(token))
  } catch {
    return null
  }
}

export function parseCroquisMeta(meta: string): CroquisMeta {
  const tokens = meta.trim().split(/\s+/).filter(Boolean)
  let showDownload = true
  let showReport = true
  let canyon: CanyoningCardData | null = null

  // Strip every recognised leading flag/token; the remainder is the title.
  while (tokens.length > 0) {
    const token = tokens[0]
    if (token === NO_DOWNLOAD_FLAG) {
      showDownload = false
    } else if (token === NO_REPORT_FLAG) {
      showReport = false
    } else if (token.startsWith(CANYON_PREFIX)) {
      canyon = decodeCanyonToken(token.slice(CANYON_PREFIX.length))
    } else {
      break
    }
    tokens.shift()
  }

  return { title: tokens.join(' '), showDownload, showReport, canyon }
}

export function serializeCroquisMeta({
  title,
  showDownload,
  showReport = true,
  canyon = null,
}: {
  title: string
  showDownload: boolean
  showReport?: boolean
  canyon?: CanyoningCardData | null
}): string {
  const parts: string[] = []
  if (!showDownload) parts.push(NO_DOWNLOAD_FLAG)
  if (!showReport) parts.push(NO_REPORT_FLAG)
  if (canyon) parts.push(CANYON_PREFIX + encodeCanyonToken(canyon))
  const trimmed = title.trim()
  if (trimmed) parts.push(trimmed)
  return parts.join(' ')
}

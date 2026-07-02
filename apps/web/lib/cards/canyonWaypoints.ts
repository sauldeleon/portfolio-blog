import { norm, resolveCategory } from './waypoints'

/** A single note line attached to a canyon waypoint. */
export interface CanyonWaypointNote {
  text: string
  /** Nested (indented) note beneath the previous one. */
  sub: boolean
}

export type CanyonSide = 'left' | 'right'
export type CanyonSeverity = 'easy' | 'caution' | 'danger'

/** An obstacle / point of interest along a canyon descent. */
export interface CanyonWaypoint {
  /**
   * Resolved category keys (index STRINGS.categories + CAT_ICON). Usually one;
   * a combined prefix like `rapel/salto` yields two (drawn as a split badge).
   */
  categories: string[]
  title: string
  lat?: number
  lon?: number
  notes: CanyonWaypointNote[]
  /** Manual override for the side pill (else auto-detected from the title). */
  side?: CanyonSide
  /** Manual override for severity (else auto-detected from title + notes). */
  severity?: CanyonSeverity
  /** Manual override for the drop-height pill (else parsed from the title). */
  meters?: string
  /** Illustrative photos shown when hovering the obstacle in a croquis. */
  photos?: string[]
}

/** Parsed manual overrides carried by a `! side=…; sev=…; m=…; img=…` directive. */
interface Overrides {
  side?: CanyonSide
  severity?: CanyonSeverity
  meters?: string
  photos?: string[]
}

/** Category-prefix word (normalized, `/`-stripped) → category key. */
const PREFIX_CATEGORY: Record<string, string> = {
  salto: 'salto',
  rapel: 'rappel',
  rappel: 'rappel',
  tobogan: 'tobogan',
  destrepe: 'destrepe',
  info: 'info',
  poza: 'poza',
  cascada: 'cascada',
  refugio: 'refugio',
  fuente: 'fuente',
  cruce: 'cruce',
  ferrata: 'ferrata',
  canyon: 'canyon',
  summit: 'summit',
  alert: 'alert',
  glacier: 'glacier',
}

/** Decode the handful of XML entities GPX authors emit. */
function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

/**
 * Resolve a leading category prefix (e.g. "salto", "salto/rapel", "tobogán")
 * to category keys. Combined prefixes split on `/` yield up to two distinct
 * keys. Returns null when none of the tokens is a recognised category.
 */
function prefixCategories(raw: string): string[] | null {
  const keys = norm(raw)
    .split('/')
    .map((s) => s.trim())
    .map((k) => PREFIX_CATEGORY[k])
    .filter((k): k is string => Boolean(k))
  const unique = [...new Set(keys)].slice(0, 2)
  return unique.length ? unique : null
}

/**
 * Split a header line (coordinates already removed) into its categories and
 * title. Recognises a `prefix:` or `prefix -` marker; otherwise the whole line
 * is the title and the category is resolved from its wording.
 */
function splitTitle(line: string): { categories: string[]; title: string } {
  const colon = /^\s*([\p{L}/ ]+?)\s*:\s*(.+)$/u.exec(line)
  if (colon) {
    const cats = prefixCategories(colon[1])
    if (cats) return { categories: cats, title: colon[2].trim() }
  }
  const dash = /^\s*([\p{L}/]+)\s+-\s+(.+)$/u.exec(line)
  if (dash) {
    const cats = prefixCategories(dash[1])
    if (cats) return { categories: cats, title: dash[2].trim() }
  }
  return { categories: [resolveCategory(line, undefined)], title: line.trim() }
}

/** Pull the trailing `lat lon` pair (if any) off a header line. */
function extractCoords(line: string): {
  lat?: number
  lon?: number
  rest: string
} {
  const m = /(-?\d{1,3}[.,]\d+)\s+(-?\d{1,3}[.,]\d+)\s*$/.exec(line)
  if (!m) return { rest: line.trim() }
  const lat = Number(m[1].replace(',', '.'))
  const lon = Number(m[2].replace(',', '.'))
  const rest = line
    .slice(0, m.index)
    .replace(/[-–—]\s*$/, '')
    .trim()
  return { lat, lon, rest }
}

/** Parse a single raw note line, or null when it is blank. */
function parseNote(line: string): CanyonWaypointNote | null {
  const sub = /^\s/.test(line)
  const text = line.replace(/^\s*[-•·]?\s*/, '').trim()
  if (!text) return null
  return { text, sub }
}

/** Parse a `! side=…; sev=…; m=…` override directive line. */
function parseDirective(line: string): Overrides {
  const out: Overrides = {}
  for (const part of line.replace(/^\s*!\s*/, '').split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const key = part.slice(0, eq).trim().toLowerCase()
    const val = part.slice(eq + 1).trim()
    if (!val) continue
    if (key === 'side' && (val === 'left' || val === 'right')) out.side = val
    else if (
      key === 'sev' &&
      (val === 'easy' || val === 'caution' || val === 'danger')
    )
      out.severity = val
    else if (key === 'm') out.meters = val
    else if (key === 'img') {
      const photos = val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (photos.length) out.photos = photos
    }
  }
  return out
}

/** Split a block's body lines into notes and manual overrides. */
function parseBody(
  lines: string[],
): { notes: CanyonWaypointNote[] } & Overrides {
  const notes: CanyonWaypointNote[] = []
  const over: Overrides = {}
  for (const line of lines) {
    if (/^\s*!/.test(line)) {
      const d = parseDirective(line)
      if (d.side) over.side = d.side
      if (d.severity) over.severity = d.severity
      if (d.meters) over.meters = d.meters
      if (d.photos) over.photos = d.photos
    } else {
      const n = parseNote(line)
      if (n) notes.push(n)
    }
  }
  return { notes, ...over }
}

/** Assemble a waypoint, attaching only the overrides that are set. */
function buildWaypoint(
  base: Pick<CanyonWaypoint, 'categories' | 'title' | 'lat' | 'lon'>,
  body: { notes: CanyonWaypointNote[] } & Overrides,
): CanyonWaypoint {
  const wp: CanyonWaypoint = { ...base, notes: body.notes }
  if (body.side) wp.side = body.side
  if (body.severity) wp.severity = body.severity
  if (body.meters) wp.meters = body.meters
  if (body.photos) wp.photos = body.photos
  return wp
}

/** Parse one block of the text format (already trimmed and non-empty). */
function parseBlock(block: string): CanyonWaypoint {
  const lines = block.split('\n').map((l) => l.replace(/\s+$/, ''))
  const { lat, lon, rest } = extractCoords(lines[0])
  const { categories, title } = splitTitle(rest)
  return buildWaypoint(
    { categories, title, lat, lon },
    parseBody(lines.slice(1)),
  )
}

/**
 * Parse the free-text canyon waypoint format: blocks separated by a `---`
 * line, each starting with `[category:] title - lat lon` followed by note
 * lines (nested when indented).
 */
export function parseCanyonWaypointsText(text: string): CanyonWaypoint[] {
  return text
    .split(/^\s*---+\s*$/m)
    .map((b) => b.trim())
    .filter(Boolean)
    .map(parseBlock)
}

/**
 * Parse `<wpt>` elements from GPX text into canyon waypoints. The `<name>`
 * carries the (optionally prefixed) title; the `<desc>` (or `<cmt>`) holds the
 * newline-separated notes. Elevation is not required.
 */
export function parseCanyonWaypointsGpx(xml: string): CanyonWaypoint[] {
  const out: CanyonWaypoint[] = []
  const re = /<wpt\b([^>]*)>([\s\S]*?)<\/wpt>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) {
    const attrs = m[1]
    const inner = m[2]
    const lat = Number(/\blat="([^"]+)"/.exec(attrs)?.[1])
    const lon = Number(/\blon="([^"]+)"/.exec(attrs)?.[1])
    const name = decodeXml(/<name>([\s\S]*?)<\/name>/.exec(inner)?.[1] ?? '')
    const desc = decodeXml(
      /<desc>([\s\S]*?)<\/desc>/.exec(inner)?.[1] ??
        /<cmt>([\s\S]*?)<\/cmt>/.exec(inner)?.[1] ??
        '',
    )
    const { categories, title } = splitTitle(name.trim())
    out.push(
      buildWaypoint(
        {
          categories,
          title,
          lat: Number.isFinite(lat) ? lat : undefined,
          lon: Number.isFinite(lon) ? lon : undefined,
        },
        parseBody(desc.split(/\r?\n/)),
      ),
    )
  }
  return out
}

/**
 * Serialise waypoints back into the editable text format, so an imported GPX
 * can be tweaked in the textarea. Round-trips through parseCanyonWaypointsText.
 */
export function serializeCanyonWaypoints(waypoints: CanyonWaypoint[]): string {
  return waypoints
    .map((w) => {
      const coords =
        w.lat != null && w.lon != null ? ` - ${w.lat} ${w.lon}` : ''
      const head = `${w.categories.join('/')}: ${w.title}${coords}`
      const dir: string[] = []
      if (w.side) dir.push(`side=${w.side}`)
      if (w.severity) dir.push(`sev=${w.severity}`)
      if (w.meters) dir.push(`m=${w.meters}`)
      if (w.photos?.length) dir.push(`img=${w.photos.join(',')}`)
      const notes = w.notes.map((n) => `${n.sub ? ' ' : ''}- ${n.text}`)
      const lines = [head]
      if (dir.length) lines.push(`! ${dir.join('; ')}`)
      lines.push(...notes)
      return lines.join('\n')
    })
    .join('\n---\n')
}

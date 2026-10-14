import type {
  GpxFile,
  GpxPoint,
  GpxSegment,
  GpxTrack,
  GpxWaypoint,
} from './types'

// Child order of the GPX 1.1 `wptType` (shared by <wpt> and <trkpt>).
const WPT_CHILD_ORDER = [
  'ele',
  'time',
  'magvar',
  'geoidheight',
  'name',
  'cmt',
  'desc',
  'src',
  'link',
  'sym',
  'type',
  'fix',
  'sat',
  'hdop',
  'vdop',
  'pdop',
  'ageofdgpsdata',
  'dgpsid',
  'extensions',
]

// Child order of the GPX 1.1 `trkType`.
const TRK_CHILD_ORDER = [
  'name',
  'cmt',
  'desc',
  'src',
  'link',
  'number',
  'type',
  'extensions',
  'trkseg',
]

// Child order of the GPX 1.1 `metadataType`.
const METADATA_CHILD_ORDER = [
  'name',
  'desc',
  'author',
  'copyright',
  'link',
  'time',
  'keywords',
  'bounds',
  'extensions',
]

// Root children that must come after the waypoints.
const AFTER_WAYPOINTS = ['rte', 'trk', 'extensions']

let waypointSeq = 0

export function createWaypointId(): string {
  waypointSeq += 1
  return `wpt-${waypointSeq}`
}

function childrenByName(el: Element, name: string): Element[] {
  return Array.from(el.children).filter((c) => c.localName === name)
}

function childText(el: Element, name: string): string | null {
  return childrenByName(el, name)[0]?.textContent ?? null
}

function parseNumber(value: string | null): number | null {
  if (value === null) return null
  const n = parseFloat(value)
  return Number.isNaN(n) ? null : n
}

function parseTime(value: string | null): number | null {
  if (value === null) return null
  const t = Date.parse(value)
  return Number.isNaN(t) ? null : t
}

function parsePoint(el: Element): GpxPoint {
  return {
    lat: parseNumber(el.getAttribute('lat')) ?? 0,
    lon: parseNumber(el.getAttribute('lon')) ?? 0,
    ele: parseNumber(childText(el, 'ele')),
    time: parseTime(childText(el, 'time')),
    source: el,
  }
}

function parseWaypoint(el: Element): GpxWaypoint {
  return {
    id: createWaypointId(),
    lat: parseNumber(el.getAttribute('lat')) ?? 0,
    lon: parseNumber(el.getAttribute('lon')) ?? 0,
    ele: parseNumber(childText(el, 'ele')),
    name: childText(el, 'name') ?? '',
    desc: childText(el, 'desc') ?? '',
    sym: childText(el, 'sym') ?? '',
    source: el,
  }
}

export function parseGpxFile(text: string): GpxFile {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  const root = doc.documentElement
  if (
    doc.getElementsByTagName('parsererror').length > 0 ||
    root.localName !== 'gpx'
  ) {
    throw new Error('Invalid GPX file')
  }
  const tracks: GpxTrack[] = childrenByName(root, 'trk').map((trk) => ({
    name: childText(trk, 'name') ?? '',
    segments: childrenByName(trk, 'trkseg').map((seg): GpxSegment => ({
      points: childrenByName(seg, 'trkpt').map(parsePoint),
    })),
  }))
  const waypoints = childrenByName(root, 'wpt').map(parseWaypoint)
  return { doc, tracks, waypoints }
}

function formatCoord(value: number): string {
  return String(Number(value.toFixed(7)))
}

function setCoord(el: Element, attr: 'lat' | 'lon', value: number) {
  // Leave untouched coordinates byte-identical to the original file.
  if (parseNumber(el.getAttribute(attr)) !== value) {
    el.setAttribute(attr, formatCoord(value))
  }
}

/**
 * Sets (or removes, when `value` is null/empty) a child element's text while
 * keeping the GPX schema's child order.
 */
function setChild(
  el: Element,
  name: string,
  value: string | null,
  order: string[] = WPT_CHILD_ORDER,
) {
  const existing = childrenByName(el, name)[0]
  if (value === null || value === '') {
    existing?.remove()
    return
  }
  if (existing) {
    if (existing.textContent !== value) existing.textContent = value
    return
  }
  const child = el.ownerDocument.createElementNS(el.namespaceURI, name)
  child.textContent = value
  const rank = order.indexOf(name)
  const before = Array.from(el.children).find(
    (c) => order.indexOf(c.localName) > rank,
  )
  el.insertBefore(child, before ?? null)
}

function formatEle(el: Element, ele: number | null): string | null {
  if (ele === null) return null
  // Keep the original text when the value did not change.
  const current = childText(el, 'ele')
  return parseNumber(current) === ele && current !== null
    ? current
    : String(Math.round(ele * 10) / 10)
}

function formatTime(el: Element, time: number | null): string | null {
  if (time === null) return null
  const current = childText(el, 'time')
  return current !== null && parseTime(current) === time
    ? current
    : new Date(time).toISOString()
}

function buildElement(
  doc: Document,
  name: string,
  source: Element | undefined,
): Element {
  return source
    ? (doc.importNode(source, true) as Element)
    : doc.createElementNS(doc.documentElement.namespaceURI, name)
}

function buildPoint(doc: Document, point: GpxPoint, stripTimes: boolean) {
  const el = buildElement(doc, 'trkpt', point.source)
  setCoord(el, 'lat', point.lat)
  setCoord(el, 'lon', point.lon)
  setChild(el, 'ele', formatEle(el, point.ele))
  setChild(el, 'time', stripTimes ? null : formatTime(el, point.time))
  return el
}

function buildWaypoint(doc: Document, waypoint: GpxWaypoint) {
  const el = buildElement(doc, 'wpt', waypoint.source)
  setCoord(el, 'lat', waypoint.lat)
  setCoord(el, 'lon', waypoint.lon)
  setChild(el, 'ele', formatEle(el, waypoint.ele))
  setChild(el, 'name', waypoint.name)
  setChild(el, 'desc', waypoint.desc)
  setChild(el, 'sym', waypoint.sym)
  return el
}

function removeWhitespace(node: Node) {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === 3 && !child.textContent?.trim()) child.remove()
    else if (child.nodeType === 1) removeWhitespace(child)
  })
}

function indent(el: Element, level: number) {
  const children = Array.from(el.children)
  if (children.length === 0) return
  const doc = el.ownerDocument
  children.forEach((child) => {
    el.insertBefore(doc.createTextNode(`\n${'  '.repeat(level + 1)}`), child)
    indent(child, level + 1)
  })
  el.appendChild(doc.createTextNode(`\n${'  '.repeat(level)}`))
}

/**
 * Renames the file's tracks (numbered when there are several) and its
 * `<metadata><name>`, if present.
 */
export function renameGpxFile(file: GpxFile, name: string): GpxFile {
  const doc = file.doc.cloneNode(true) as Document
  const metadata = childrenByName(doc.documentElement, 'metadata')[0]
  if (metadata) setChild(metadata, 'name', name, METADATA_CHILD_ORDER)
  return {
    ...file,
    doc,
    tracks: file.tracks.map((track, i) => ({
      ...track,
      name: file.tracks.length > 1 ? `${name} ${i + 1}` : name,
    })),
  }
}

export interface SerializeOptions {
  /** Drop every `<time>` from track points (privacy). */
  stripTimes?: boolean
}

/**
 * Writes the edited tracks and waypoints back into a copy of the original
 * document, so metadata, routes and extensions survive the round trip.
 */
export function serializeGpxFile(
  file: GpxFile,
  { stripTimes = false }: SerializeOptions = {},
): string {
  const doc = file.doc.cloneNode(true) as Document
  const root = doc.documentElement

  childrenByName(root, 'wpt').forEach((wpt) => wpt.remove())
  const anchor =
    Array.from(root.children).find((c) =>
      AFTER_WAYPOINTS.includes(c.localName),
    ) ?? null
  file.waypoints.forEach((waypoint) => {
    root.insertBefore(buildWaypoint(doc, waypoint), anchor)
  })

  const trkEls = childrenByName(root, 'trk')
  file.tracks.forEach((track, ti) => {
    const trk = trkEls[ti]
    /* istanbul ignore next -- the editor never adds tracks */
    if (!trk) return
    // Only touch the name when it changed, so untouched files round-trip.
    if (track.name !== (childText(trk, 'name') ?? '')) {
      setChild(trk, 'name', track.name, TRK_CHILD_ORDER)
    }
    const segEls = childrenByName(trk, 'trkseg')
    segEls.slice(track.segments.length).forEach((seg) => seg.remove())
    track.segments.forEach((segment, si) => {
      let seg = segEls[si]
      if (seg) {
        childrenByName(seg, 'trkpt').forEach((pt) => pt.remove())
      } else {
        seg = doc.createElementNS(root.namespaceURI, 'trkseg')
        trk.appendChild(seg)
      }
      const segExtensions = childrenByName(seg, 'extensions')[0] ?? null
      segment.points.forEach((point) => {
        seg.insertBefore(buildPoint(doc, point, stripTimes), segExtensions)
      })
    })
  })

  removeWhitespace(root)
  indent(root, 0)
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(root)}\n`
}

import type { IconKind } from './icons'
import type { Lang } from './theme'

export interface Waypoint {
  name: string
  lat: number
  lon: number
  ele: number
  /** Resolved category key (indexes STRINGS.categories + CAT_ICON). */
  category: string
}

/** Category key → icon kind to draw. */
const CAT_ICON: Record<string, IconKind> = {
  refugio: 'refugio',
  fuente: 'fuente',
  cruce: 'cruce',
  info: 'info',
  cascada: 'cascada',
  summit: 'summit',
  alert: 'alert',
  glacier: 'glacier',
  rappel: 'rappel',
  salto: 'drops',
  tobogan: 'slide',
  poza: 'poza',
  destrepe: 'downclimb',
  ferrata: 'ferrata',
  canyon: 'canyon',
}

/** GPX <sym> value → category key. */
const SYM_MAP: Record<string, string> = {
  shelter: 'refugio',
  lodge: 'refugio',
  'drinking water': 'fuente',
  'water source': 'fuente',
  information: 'info',
  crossing: 'cruce',
  waterfall: 'cascada',
  summit: 'summit',
  alert: 'alert',
  danger: 'alert',
  glacier: 'glacier',
}

/** Name substring (normalized) → category key; first match wins. */
const NAME_KEYS: Array<[string, string]> = [
  ['refugio', 'refugio'],
  ['rapel', 'rappel'],
  ['rappel', 'rappel'],
  ['salto', 'salto'],
  ['tobogan', 'tobogan'],
  ['destrepe', 'destrepe'],
  ['poza', 'poza'],
  ['ferrata', 'ferrata'],
  ['encajon', 'canyon'],
  ['estrechamiento', 'canyon'],
  ['cascada', 'cascada'],
  ['fuente', 'fuente'],
  ['desvio', 'cruce'],
  ['cruce', 'cruce'],
  ['cumbre', 'summit'],
  ['cima', 'summit'],
  ['monte perdido', 'summit'],
  ['pico', 'summit'],
  ['serac', 'alert'],
  ['glaciar', 'glacier'],
]

/** Static ES → EN waypoint name translations (applied only for lang=en). */
const WAYPOINT_TRANSLATIONS: Record<string, string> = {
  Cascada: 'Waterfall',
  Cascadas: 'Waterfalls',
  Desvío: 'Junction',
  Fuente: 'Spring (water source)',
  Reunión: 'Belay station',
  Destrepe: 'Downclimb',
  'Brecha de Roland': "Roland's Breach",
  'Clavijas - Punto de rápel': 'Pegs - rappel point',
  'Pradera de Ordesa': 'Ordesa Meadow',
  'Inicio de escalada': 'Start of the climb',
}

/** Ordered category keys for the custom single-waypoint picker. */
export const WAYPOINT_CATEGORY_KEYS = [
  'refugio',
  'fuente',
  'cruce',
  'cascada',
  'summit',
  'alert',
  'glacier',
  'rappel',
  'salto',
  'tobogan',
  'poza',
  'destrepe',
  'ferrata',
  'canyon',
  'info',
] as const

/** Strip diacritics and lowercase. */
export function norm(s: string): string {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

/** Resolve a waypoint's category from its GPX symbol, then its name. */
export function resolveCategory(
  name: string | undefined,
  sym: string | undefined,
): string {
  const s = sym?.trim().toLowerCase()
  if (s && SYM_MAP[s]) return SYM_MAP[s]
  const n = norm(name ?? '')
  for (const [key, cat] of NAME_KEYS) if (n.includes(key)) return cat
  return 'info'
}

/** Icon kind for a resolved category. */
export function categoryIcon(category: string): IconKind {
  return CAT_ICON[category] ?? 'info'
}

/** Display name for a card language (EN applies the translation table). */
export function translateName(name: string, lang: Lang): string {
  if (lang !== 'en') return name
  return WAYPOINT_TRANSLATIONS[name] ?? name
}

/** Filename-safe slug for a waypoint name. */
export function waypointSlug(s: string): string {
  const base = norm(s)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return base || 'wpt'
}

/** Parse `<wpt>` elements that have an elevation from GPX text. */
export function parseWaypoints(xml: string): Waypoint[] {
  const out: Waypoint[] = []
  const re = /<wpt\b([^>]*)>([\s\S]*?)<\/wpt>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) {
    const attrs = m[1]
    const inner = m[2]
    const lat = Number(/\blat="([^"]+)"/.exec(attrs)?.[1])
    const lon = Number(/\blon="([^"]+)"/.exec(attrs)?.[1])
    const ele = Number(/<ele>([^<]+)<\/ele>/.exec(inner)?.[1])
    if (!isFinite(lat) || !isFinite(lon) || !isFinite(ele)) continue
    const name = decodeXml(/<name>([\s\S]*?)<\/name>/.exec(inner)?.[1] ?? '')
    const sym = decodeXml(/<sym>([\s\S]*?)<\/sym>/.exec(inner)?.[1] ?? '')
    out.push({
      name,
      lat,
      lon,
      ele: Math.round(ele),
      category: resolveCategory(name, sym),
    })
  }
  return out
}

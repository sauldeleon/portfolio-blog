const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`

const pin = (fill: string, iconSvg = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 26" width="20" height="26">` +
  `<path d="M10 0C4.477 0 0 4.477 0 10C0 17.5 10 26 10 26S20 17.5 20 10C20 4.477 15.523 0 10 0Z" fill="${fill}" stroke="white" stroke-width="1.2"/>` +
  (iconSvg || `<circle cx="10" cy="10" r="4" fill="white"/>`) +
  `</svg>`

export const MAP_ICON_START = svgToDataUrl(pin('#22c55e'))
export const MAP_ICON_END = svgToDataUrl(pin('#ef4444'))

const ICON_INFO =
  `<circle cx="10" cy="6.5" r="1" fill="white"/>` +
  `<line x1="10" y1="9" x2="10" y2="14" stroke="white" stroke-width="1.8" stroke-linecap="round"/>`

export const MAP_ICON_WPT = svgToDataUrl(pin('#3b82f6', ICON_INFO))

// Inner SVG icon fragments — coordinates within the 20×26 pin, head centered at (10,10)
const ICON_WARNING =
  `<polygon points="10,5 15,14 5,14" stroke="white" stroke-width="1.2" stroke-linejoin="round" fill="none"/>` +
  `<line x1="10" y1="8" x2="10" y2="11" stroke="white" stroke-width="1.2" stroke-linecap="round"/>` +
  `<circle cx="10" cy="12.5" r=".6" fill="white"/>`

const ICON_SUMMIT =
  `<polyline points="5,14 10,5 15,14" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`

const ICON_WATER =
  `<path d="M10,5 C14,8 14,12 10,14 C6,12 6,8 10,5Z" fill="white"/>`

const ICON_CAMP =
  `<polyline points="5,14 10,5 15,14" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
  `<polyline points="8.5,14 8.5,11 11.5,11 11.5,14" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`

const ICON_FOOD =
  `<line x1="10" y1="10" x2="10" y2="15" stroke="white" stroke-width="1.5" stroke-linecap="round"/>` +
  `<path d="M8,5 L8,8.5 Q10,10 10,10 Q12,10 12,8.5 L12,5" stroke="white" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
  `<line x1="10" y1="5" x2="10" y2="8.5" stroke="white" stroke-width="1.1" stroke-linecap="round"/>`

const ICON_PARKING =
  `<text x="10" y="10" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">P</text>`

const ICON_MEDICAL =
  `<line x1="10" y1="5.5" x2="10" y2="14.5" stroke="white" stroke-width="2" stroke-linecap="round"/>` +
  `<line x1="5.5" y1="10" x2="14.5" y2="10" stroke="white" stroke-width="2" stroke-linecap="round"/>`

const ICON_CYCLING =
  `<circle cx="10" cy="10" r="5" stroke="white" stroke-width="1.2" fill="none"/>` +
  `<circle cx="10" cy="10" r="1.5" fill="white"/>` +
  `<line x1="10" y1="5" x2="10" y2="15" stroke="white" stroke-width=".9"/>` +
  `<line x1="5" y1="10" x2="15" y2="10" stroke="white" stroke-width=".9"/>`

const ICON_SCENIC =
  `<polygon points="10,5 11.18,8.38 14.76,8.46 11.9,10.62 12.94,14.05 10,12 7.06,14.05 8.1,10.62 5.24,8.46 8.82,8.38" fill="white"/>`

// Sym-specific waypoint icons (Garmin / gpxstudio symbol categories)
const MAP_ICON_WPT_WARNING = svgToDataUrl(pin('#f59e0b', ICON_WARNING)) // amber  — warning / danger
const MAP_ICON_WPT_SUMMIT = svgToDataUrl(pin('#8b5cf6', ICON_SUMMIT)) // purple — summit / terrain
const MAP_ICON_WPT_WATER = svgToDataUrl(pin('#0ea5e9', ICON_WATER)) // sky    — water / swimming
const MAP_ICON_WPT_CAMP = svgToDataUrl(pin('#10b981', ICON_CAMP)) // emerald— camping / trail
const MAP_ICON_WPT_FOOD = svgToDataUrl(pin('#f97316', ICON_FOOD)) // orange — food / restaurant
const MAP_ICON_WPT_PARKING = svgToDataUrl(pin('#64748b', ICON_PARKING)) // slate  — parking
const MAP_ICON_WPT_MEDICAL = svgToDataUrl(pin('#dc2626', ICON_MEDICAL)) // red    — medical
const MAP_ICON_WPT_CYCLING = svgToDataUrl(pin('#06b6d4', ICON_CYCLING)) // cyan   — cycling
const MAP_ICON_WPT_SCENIC = svgToDataUrl(pin('#ec4899', ICON_SCENIC)) // pink   — scenic / photo

export const MAP_ICON_SIZE: [number, number] = [20, 26]
export const MAP_ICON_ANCHOR: [number, number] = [10, 26]

export const TRANSPARENT_1PX =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// Full Garmin / gpxstudio sym → icon URL mapping.
// The '' key is the leaflet-gpx fallback for unknown/missing <sym>.
export const WPT_ICON_URLS: Record<string, string> = {
  '': MAP_ICON_WPT,
  Dot: MAP_ICON_WPT,
  Waypoint: MAP_ICON_WPT,
  Flag: MAP_ICON_WPT,
  'Flag, Blue': MAP_ICON_WPT,
  Pin: MAP_ICON_WPT,
  'Pin, Blue': MAP_ICON_WPT,

  // Warning / danger / alert
  Alert: MAP_ICON_WPT_WARNING,
  Warning: MAP_ICON_WPT_WARNING,
  'Danger Area': MAP_ICON_WPT_WARNING,
  'Skull and Crossbones': MAP_ICON_WPT_WARNING,
  'Block, Red': MAP_ICON_WPT_WARNING,
  'Flag, Red': MAP_ICON_WPT_WARNING,
  'Pin, Red': MAP_ICON_WPT_WARNING,

  // Summit / terrain
  Summit: MAP_ICON_WPT_SUMMIT,
  Valley: MAP_ICON_WPT_SUMMIT,
  Cliff: MAP_ICON_WPT_SUMMIT,
  Mine: MAP_ICON_WPT_SUMMIT,

  // Water
  'Water Source': MAP_ICON_WPT_WATER,
  'Drinking Water': MAP_ICON_WPT_WATER,
  'Swimming Area': MAP_ICON_WPT_WATER,
  'Fishing Area': MAP_ICON_WPT_WATER,
  Marina: MAP_ICON_WPT_WATER,
  Beach: MAP_ICON_WPT_WATER,
  Falls: MAP_ICON_WPT_WATER,
  Spring: MAP_ICON_WPT_WATER,

  // Camping / trail / recreation
  Campground: MAP_ICON_WPT_CAMP,
  'Trail Head': MAP_ICON_WPT_CAMP,
  'Hunting Area': MAP_ICON_WPT_CAMP,
  Forest: MAP_ICON_WPT_CAMP,
  Park: MAP_ICON_WPT_CAMP,
  'Picnic Area': MAP_ICON_WPT_CAMP,
  'Flag, Green': MAP_ICON_WPT_CAMP,
  'Pin, Green': MAP_ICON_WPT_CAMP,

  // Food / restaurant
  Restaurant: MAP_ICON_WPT_FOOD,
  'Food Source': MAP_ICON_WPT_FOOD,
  Bar: MAP_ICON_WPT_FOOD,
  Pizza: MAP_ICON_WPT_FOOD,
  'Fast Food': MAP_ICON_WPT_FOOD,
  Coffee: MAP_ICON_WPT_FOOD,

  // Parking
  'Parking Area': MAP_ICON_WPT_PARKING,

  // Medical
  'Medical Facility': MAP_ICON_WPT_MEDICAL,
  'First Aid': MAP_ICON_WPT_MEDICAL,
  Pharmacy: MAP_ICON_WPT_MEDICAL,
  Hospital: MAP_ICON_WPT_MEDICAL,

  // Cycling
  'Bike Trail': MAP_ICON_WPT_CYCLING,
  'Bicycle Path': MAP_ICON_WPT_CYCLING,

  // Information (generic info points — blue, same as default)
  Information: MAP_ICON_WPT,

  // Scenic / photo
  'Scenic Area': MAP_ICON_WPT_SCENIC,
  Camera: MAP_ICON_WPT_SCENIC,
  Museum: MAP_ICON_WPT_SCENIC,
  Theater: MAP_ICON_WPT_SCENIC,
}

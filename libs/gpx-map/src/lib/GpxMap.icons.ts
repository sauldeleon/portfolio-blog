const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`

const pin = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 26" width="20" height="26">` +
  `<path d="M10 0C4.477 0 0 4.477 0 10C0 17.5 10 26 10 26S20 17.5 20 10C20 4.477 15.523 0 10 0Z" fill="${fill}" stroke="white" stroke-width="1.2"/>` +
  `<circle cx="10" cy="10" r="4" fill="white"/>` +
  `</svg>`

export const MAP_ICON_START = svgToDataUrl(pin('#22c55e'))
export const MAP_ICON_END = svgToDataUrl(pin('#ef4444'))
export const MAP_ICON_WPT = svgToDataUrl(pin('#3b82f6'))

// Sym-specific waypoint icons (Garmin / gpxstudio symbol categories)
const MAP_ICON_WPT_WARNING = svgToDataUrl(pin('#f59e0b')) // amber  — warning / danger
const MAP_ICON_WPT_SUMMIT = svgToDataUrl(pin('#8b5cf6')) // purple — summit / terrain
const MAP_ICON_WPT_WATER = svgToDataUrl(pin('#0ea5e9')) // sky    — water / swimming
const MAP_ICON_WPT_CAMP = svgToDataUrl(pin('#10b981')) // emerald— camping / trail
const MAP_ICON_WPT_FOOD = svgToDataUrl(pin('#f97316')) // orange — food / restaurant
const MAP_ICON_WPT_PARKING = svgToDataUrl(pin('#64748b')) // slate  — parking
const MAP_ICON_WPT_MEDICAL = svgToDataUrl(pin('#dc2626')) // red    — medical
const MAP_ICON_WPT_CYCLING = svgToDataUrl(pin('#06b6d4')) // cyan   — cycling
const MAP_ICON_WPT_SCENIC = svgToDataUrl(pin('#ec4899')) // pink   — scenic / photo

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

  // Warning / danger
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

  // Camping / trail
  Campground: MAP_ICON_WPT_CAMP,
  'Trail Head': MAP_ICON_WPT_CAMP,
  'Hunting Area': MAP_ICON_WPT_CAMP,
  Forest: MAP_ICON_WPT_CAMP,
  Park: MAP_ICON_WPT_CAMP,
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

  // Scenic / photo
  'Scenic Area': MAP_ICON_WPT_SCENIC,
  Camera: MAP_ICON_WPT_SCENIC,
  Museum: MAP_ICON_WPT_SCENIC,
  Theater: MAP_ICON_WPT_SCENIC,
}

const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`

const pin = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 33" width="25" height="33">` +
  `<path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 33 12.5 33S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="${fill}" stroke="white" stroke-width="1.5"/>` +
  `<circle cx="12.5" cy="12.5" r="5" fill="white"/>` +
  `</svg>`

export const MAP_ICON_START = svgToDataUrl(pin('#22c55e'))
export const MAP_ICON_END = svgToDataUrl(pin('#ef4444'))
export const MAP_ICON_WPT = svgToDataUrl(pin('#3b82f6'))

export const MAP_ICON_SIZE: [number, number] = [25, 33]
export const MAP_ICON_ANCHOR: [number, number] = [12, 33]

export const TRANSPARENT_1PX =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

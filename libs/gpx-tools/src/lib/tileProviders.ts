/** Base map layers shared by the post map and the admin track editor. */
export const TILE_PROVIDERS = [
  {
    id: 'osm',
    label: 'OSM',
    maxZoom: 19,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'topo',
    label: 'Topo',
    maxZoom: 17,
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    maxZoom: 19,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy;',
  },
]

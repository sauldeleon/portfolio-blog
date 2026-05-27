import * as L from 'leaflet'

declare module 'leaflet' {
  interface GPXOptions {
    async?: boolean
    polyline_options?: L.PolylineOptions
    marker_options?: {
      startIconUrl?: string | null
      endIconUrl?: string | null
      shadowUrl?: string | null
      wptIconUrls?: Record<string, string | null>
      iconSize?: [number, number]
      iconAnchor?: [number, number]
      shadowSize?: [number, number]
    }
  }

  class GPX extends L.FeatureGroup {
    constructor(gpx: string, options?: GPXOptions)
    getBounds(): L.LatLngBounds
    get_name(): string
    get_distance(): number
    get_elevation_gain(): number
    get_elevation_loss(): number
    get_moving_time(): number
    get_total_time(): number
  }
}

declare module 'leaflet-gpx' {}

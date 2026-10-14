export interface LatLon {
  lat: number
  lon: number
}

export interface GpxPoint extends LatLon {
  ele: number | null
  /** Epoch milliseconds. */
  time: number | null
  /** Original `<trkpt>` element, kept so serialising preserves its extensions. */
  source?: Element
}

export interface GpxWaypoint extends LatLon {
  id: string
  ele: number | null
  name: string
  desc: string
  sym: string
  /** Original `<wpt>` element, kept so serialising preserves its extensions. */
  source?: Element
}

export interface GpxSegment {
  points: GpxPoint[]
}

export interface GpxTrack {
  name: string
  segments: GpxSegment[]
}

export interface GpxFile {
  doc: Document
  tracks: GpxTrack[]
  waypoints: GpxWaypoint[]
}

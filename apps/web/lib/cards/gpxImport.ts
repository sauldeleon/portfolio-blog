import axios, { isAxiosError } from 'axios'

import type { CanyonWaypoint } from './canyonWaypoints'
import type { GpxMetrics } from './gpx'
import type { RouteLandmark } from './types'
import type { Waypoint } from './waypoints'

/**
 * Fetch and parse a GPX url through one of the cards APIs. Returns the parsed
 * data (or undefined when the response carries none); throws on a
 * network/HTTP error for the caller to map to a message.
 */
async function fetchCardGpx<T>(
  endpoint: string,
  url: string,
): Promise<T | undefined> {
  const res = await axios.get<{ data?: T }>(`/api/cards/${endpoint}`, {
    params: { url },
  })
  return res.data.data
}

/** Route metrics (distance, times, profile, landmarks) of a GPX url. */
export const fetchGpxMetrics = (url: string) =>
  fetchCardGpx<GpxMetrics>('gpx', url)

/** The waypoints of a GPX url, for waypoint cards. */
export const fetchWaypoints = (url: string) =>
  fetchCardGpx<Waypoint[]>('waypoints', url)

/** The canyon waypoints (rappels, pools…) of a GPX url. */
export const fetchCanyonWaypoints = (url: string) =>
  fetchCardGpx<CanyonWaypoint[]>('canyon-waypoints', url)

/**
 * Names the parsed landmarks from OpenStreetMap through its own request, so a
 * slow Overpass never holds up the parse. Any failure keeps them as they were.
 */
export async function withOsmNames(metrics: GpxMetrics): Promise<GpxMetrics> {
  if (!metrics.landmarks?.some((l) => !l.name)) return metrics
  try {
    const res = await axios.post<{
      data: { landmarks: RouteLandmark[]; unavailable: boolean }
    }>('/api/cards/places', { landmarks: metrics.landmarks })
    const { landmarks, unavailable } = res.data.data
    return { ...metrics, landmarks, placesUnavailable: unavailable }
  } catch {
    return { ...metrics, placesUnavailable: true }
  }
}

/** The server-provided error message for an axios failure, else `fallback`. */
export function axiosErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err) ? (err.response?.data?.error ?? fallback) : fallback
}

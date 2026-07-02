import axios, { isAxiosError } from 'axios'

import type { CanyonWaypoint } from './canyonWaypoints'

/**
 * Fetch and parse canyon waypoints from a GPX url via the cards API. Returns
 * the parsed waypoints (or undefined when the response carries none); throws
 * on a network/HTTP error for the caller to map to a message.
 */
export async function fetchCanyonWaypoints(
  url: string,
): Promise<CanyonWaypoint[] | undefined> {
  const res = await axios.get<{ data?: CanyonWaypoint[] }>(
    '/api/cards/canyon-waypoints',
    { params: { url } },
  )
  return res.data.data
}

/** The server-provided error message for an axios failure, else `fallback`. */
export function axiosErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err) ? (err.response?.data?.error ?? fallback) : fallback
}

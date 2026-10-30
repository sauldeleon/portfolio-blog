import { gpxUrlRoute } from '@web/lib/api/gpxUrlRoute'
import { parseGpx } from '@web/lib/cards'

/**
 * Route metrics of a GPX. Summit and col names from OpenStreetMap are asked
 * for separately (`/api/cards/places`): a slow Overpass must never stall this.
 */
export const GET = gpxUrlRoute(parseGpx, 'GPX')

import { gpxUrlRoute } from '@web/lib/api/gpxUrlRoute'
import { parseCanyonWaypointsGpx } from '@web/lib/cards'

export const GET = gpxUrlRoute(parseCanyonWaypointsGpx, 'GPX canyon waypoints')

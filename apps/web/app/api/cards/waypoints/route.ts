import { gpxUrlRoute } from '@web/lib/api/gpxUrlRoute'
import { parseWaypoints } from '@web/lib/cards'

export const GET = gpxUrlRoute(parseWaypoints, 'GPX waypoints')

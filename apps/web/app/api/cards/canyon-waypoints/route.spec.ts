/**
 * @vitest-environment node
 */
import { parseCanyonWaypointsGpx } from '@web/lib/cards'

import { GET } from './route'

vi.mock('@web/lib/api/gpxUrlRoute', () => ({
  gpxUrlRoute: (parse: unknown, label: string) => ({ parse, label }),
}))

describe('GET /api/cards/canyon-waypoints', () => {
  it('serves parseCanyonWaypointsGpx through the shared GPX route', () => {
    expect(GET).toEqual({
      parse: parseCanyonWaypointsGpx,
      label: 'GPX canyon waypoints',
    })
  })
})

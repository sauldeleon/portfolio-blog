/**
 * @vitest-environment node
 */
import { parseWaypoints } from '@web/lib/cards'

import { GET } from './route'

vi.mock('@web/lib/api/gpxUrlRoute', () => ({
  gpxUrlRoute: (parse: unknown, label: string) => ({ parse, label }),
}))

describe('GET /api/cards/waypoints', () => {
  it('serves parseWaypoints through the shared GPX route', () => {
    expect(GET).toEqual({ parse: parseWaypoints, label: 'GPX waypoints' })
  })
})

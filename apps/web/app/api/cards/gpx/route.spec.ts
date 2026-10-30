/**
 * @vitest-environment node
 */
import { parseGpx } from '@web/lib/cards'

import { GET } from './route'

vi.mock('@web/lib/api/gpxUrlRoute', () => ({
  gpxUrlRoute: (parse: unknown, label: string) => ({ parse, label }),
}))

describe('GET /api/cards/gpx', () => {
  it('serves parseGpx through the shared GPX route', () => {
    expect(GET).toEqual({ parse: parseGpx, label: 'GPX' })
  })
})

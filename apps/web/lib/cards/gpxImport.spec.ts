import axios, { AxiosError } from 'axios'

import type { GpxMetrics } from './gpx'
import {
  axiosErrorMessage,
  fetchCanyonWaypoints,
  fetchGpxMetrics,
  fetchWaypoints,
  withOsmNames,
} from './gpxImport'

const URL = 'https://example.com/a.gpx'
const PEAK = { kind: 'peak', index: 1, ele: 2417, lat: 43, lon: -5.9 } as const
const metrics = { distanceKm: '17.0 km', landmarks: [PEAK] } as GpxMetrics

afterEach(() => {
  vi.restoreAllMocks()
})

describe('gpxImport', () => {
  it.each([
    [fetchGpxMetrics, '/api/cards/gpx'],
    [fetchWaypoints, '/api/cards/waypoints'],
    [fetchCanyonWaypoints, '/api/cards/canyon-waypoints'],
  ])('%o asks %s for the url', async (fetcher, endpoint) => {
    const getSpy = vi
      .spyOn(axios, 'get')
      .mockResolvedValue({ data: { data: ['x'] } })
    expect(await fetcher(URL)).toEqual(['x'])
    expect(getSpy).toHaveBeenCalledWith(endpoint, { params: { url: URL } })
  })

  describe('withOsmNames', () => {
    it('merges the names OpenStreetMap found', async () => {
      const named = [{ ...PEAK, name: 'Peña Ubiña' }]
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
        data: { data: { landmarks: named, unavailable: false } },
      })
      expect(await withOsmNames(metrics)).toEqual({
        ...metrics,
        landmarks: named,
        placesUnavailable: false,
      })
      expect(postSpy).toHaveBeenCalledWith('/api/cards/places', {
        landmarks: [PEAK],
      })
    })

    it('flags the names as unavailable when the request fails', async () => {
      vi.spyOn(axios, 'post').mockRejectedValue(new Error('timeout'))
      expect(await withOsmNames(metrics)).toEqual({
        ...metrics,
        placesUnavailable: true,
      })
    })

    it('skips the request when nothing needs a name', async () => {
      const postSpy = vi.spyOn(axios, 'post')
      const named = { ...metrics, landmarks: [{ ...PEAK, name: 'Pico' }] }
      expect(await withOsmNames(named)).toBe(named)
      // Cards saved before landmarks existed carry none.
      const old = { ...metrics, landmarks: undefined } as unknown as GpxMetrics
      expect(await withOsmNames(old)).toBe(old)
      expect(postSpy).not.toHaveBeenCalled()
    })
  })

  describe('axiosErrorMessage', () => {
    it('prefers the server message, else the fallback', () => {
      const withMessage = new AxiosError('x', '502', undefined, undefined, {
        data: { error: 'Failed to fetch GPX' },
      } as never)
      expect(axiosErrorMessage(withMessage, 'fallback')).toBe(
        'Failed to fetch GPX',
      )
      expect(axiosErrorMessage(new AxiosError('x'), 'fallback')).toBe(
        'fallback',
      )
      expect(axiosErrorMessage(new Error('x'), 'fallback')).toBe('fallback')
    })
  })
})

/**
 * @vitest-environment node
 */
import axios from 'axios'

import { GET } from './route'

const mockAuth = vi.fn()
const mockParseGpx = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('axios', () => {
  const mod = { get: vi.fn() }
  return { ...mod, default: mod }
})
vi.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
vi.mock('@web/lib/cards', () => ({
  parseGpx: (...args: unknown[]) => mockParseGpx(...args),
}))
const mockNameLandmarks = vi.fn()
vi.mock('@web/lib/cards/osmLandmarks', () => ({
  nameLandmarksFromOsm: (...args: unknown[]) => mockNameLandmarks(...args),
}))
vi.mock('@web/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}))

const mockAxiosGet = vi.mocked(axios.get)

function request(url: string | null): Request {
  const qs = url === null ? '' : `?url=${encodeURIComponent(url)}`
  return new Request(`http://localhost/api/cards/gpx${qs}`)
}

const metrics = {
  date: '15 Jul 2025',
  startTime: '09:00',
  endTime: '11:00',
  movingTime: '2:00',
  stoppedTime: '0:00',
  totalTime: '2:00',
  distanceKm: '2.2 km',
  ascent: '100 m',
  descent: '50 m',
  elevation: [1000, 1100, 1050],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'admin' } })
})

describe('GET /api/cards/gpx', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET(request('https://example.com/a.gpx'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when url is missing', async () => {
    const res = await GET(request(null))
    expect(res.status).toBe(400)
  })

  it('returns 400 for a non-http(s) url', async () => {
    const res = await GET(request('ftp://example.com/a.gpx'))
    expect(res.status).toBe(400)
  })

  it('returns 502 when the fetch fails', async () => {
    mockAxiosGet.mockRejectedValue(new Error('network'))
    const res = await GET(request('https://example.com/a.gpx'))
    expect(res.status).toBe(502)
    expect(mockLoggerError).toHaveBeenCalled()
  })

  it('returns 422 when the GPX cannot be parsed', async () => {
    mockAxiosGet.mockResolvedValue({ data: 'garbage' })
    mockParseGpx.mockImplementation(() => {
      throw new Error('No track points found')
    })
    const res = await GET(request('https://example.com/a.gpx'))
    expect(res.status).toBe(422)
  })

  it('returns 200 with parsed metrics on success', async () => {
    mockAxiosGet.mockResolvedValue({ data: '<gpx/>' })
    mockParseGpx.mockReturnValue(metrics)
    const res = await GET(request('https://example.com/a.gpx'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual(metrics)
    expect(mockNameLandmarks).not.toHaveBeenCalled()
  })

  it('names summits and cols from OpenStreetMap on request', async () => {
    mockAxiosGet.mockResolvedValue({ data: '<gpx/>' })
    mockParseGpx.mockReturnValue({ ...metrics, landmarks: [{ kind: 'peak' }] })
    mockNameLandmarks.mockResolvedValue({
      landmarks: [{ kind: 'peak', name: 'Pico' }],
      unavailable: true,
    })
    const res = await GET(
      new Request(
        `http://localhost/api/cards/gpx?url=${encodeURIComponent('https://example.com/a.gpx')}&places=1`,
      ),
    )
    expect(mockNameLandmarks).toHaveBeenCalledWith([{ kind: 'peak' }])
    const { data } = await res.json()
    expect(data.landmarks).toEqual([{ kind: 'peak', name: 'Pico' }])
    expect(data.placesUnavailable).toBe(true)
  })
})

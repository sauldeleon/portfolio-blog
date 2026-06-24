/**
 * @jest-environment node
 */
import axios from 'axios'

import { GET } from './route'

const mockAuth = jest.fn()
const mockParseGpx = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('axios', () => ({ get: jest.fn() }))
jest.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
jest.mock('@web/lib/cards', () => ({
  parseGpx: (...args: unknown[]) => mockParseGpx(...args),
}))
jest.mock('@web/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}))

const mockAxiosGet = jest.mocked(axios.get)

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
  jest.clearAllMocks()
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
  })
})

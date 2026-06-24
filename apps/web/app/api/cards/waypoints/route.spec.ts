/**
 * @jest-environment node
 */
import axios from 'axios'

import { GET } from './route'

const mockAuth = jest.fn()
const mockParseWaypoints = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('axios', () => ({ get: jest.fn() }))
jest.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
jest.mock('@web/lib/cards', () => ({
  parseWaypoints: (...args: unknown[]) => mockParseWaypoints(...args),
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
  return new Request(`http://localhost/api/cards/waypoints${qs}`)
}

const waypoints = [
  { name: 'Refugio', lat: 42.5, lon: -1.2, ele: 1850, category: 'refugio' },
]

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'admin' } })
})

describe('GET /api/cards/waypoints', () => {
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

  it('returns 200 with parsed waypoints on success', async () => {
    mockAxiosGet.mockResolvedValue({ data: '<gpx/>' })
    mockParseWaypoints.mockReturnValue(waypoints)
    const res = await GET(request('https://example.com/a.gpx'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual(waypoints)
  })
})

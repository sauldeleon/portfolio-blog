/**
 * @vitest-environment node
 */
import axios from 'axios'

import { gpxUrlRoute } from './gpxUrlRoute'

const mockAuth = vi.fn()
const mockParse = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('axios', () => {
  const mod = { get: vi.fn() }
  return { ...mod, default: mod }
})
vi.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
vi.mock('@web/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}))

const mockAxiosGet = vi.mocked(axios.get)

const GET = gpxUrlRoute(mockParse, 'GPX things')

function request(url: string | null): Request {
  const qs = url === null ? '' : `?url=${encodeURIComponent(url)}`
  return new Request(`http://localhost/api/cards/things${qs}`)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'admin' } })
})

describe('gpxUrlRoute', () => {
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

  it('returns 502 and logs the label when the fetch fails', async () => {
    const err = new Error('network')
    mockAxiosGet.mockRejectedValue(err)
    const res = await GET(request('https://example.com/a.gpx'))
    expect(res.status).toBe(502)
    expect(mockLoggerError).toHaveBeenCalledWith(
      err,
      'Failed to fetch GPX things',
    )
  })

  it('returns 422 when the GPX cannot be parsed', async () => {
    mockAxiosGet.mockResolvedValue({ data: 'garbage' })
    mockParse.mockImplementation(() => {
      throw new Error('No track points found')
    })
    const res = await GET(request('https://example.com/a.gpx'))
    expect(res.status).toBe(422)
  })

  it('fetches with a timeout and returns the parsed data', async () => {
    mockAxiosGet.mockResolvedValue({ data: '<gpx/>' })
    mockParse.mockReturnValue([{ name: 'Refugio' }])
    const res = await GET(request('https://example.com/a.gpx'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ data: [{ name: 'Refugio' }] })
    expect(mockParse).toHaveBeenCalledWith('<gpx/>')
    expect(mockAxiosGet).toHaveBeenCalledWith('https://example.com/a.gpx', {
      responseType: 'text',
      timeout: 8000,
    })
  })
})

/**
 * @jest-environment node
 */
import { GET, POST } from './route'

const mockAuth = jest.fn()
const mockList = jest.fn()
const mockWrite = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
jest.mock('@web/lib/github/tracks', () => ({
  ...jest.requireActual('@web/lib/github/tracks'),
  listTrackFiles: () => mockList(),
  writeTrackFile: (...args: unknown[]) => mockWrite(...args),
}))
jest.mock('@web/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: jest.fn(),
  },
}))

const { MissingGithubTokenError, TrackExistsError } = jest.requireActual(
  '@web/lib/github/tracks',
)

function postRequest(body: unknown) {
  return new Request('http://localhost/api/tracks', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'admin' } })
})

describe('GET /api/tracks', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    expect((await GET()).status).toBe(401)
  })

  it('returns the track files', async () => {
    mockList.mockResolvedValue({ files: [{ path: 'a.gpx' }], truncated: false })
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      files: [{ path: 'a.gpx' }],
      truncated: false,
    })
  })

  it('returns 502 when GitHub fails', async () => {
    mockList.mockRejectedValue(new Error('boom'))
    const res = await GET()
    expect(res.status).toBe(502)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

describe('POST /api/tracks', () => {
  const body = { name: 'Día 1', content: '<gpx/>' }

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    expect((await POST(postRequest(body))).status).toBe(401)
  })

  it('returns 400 for invalid names or content', async () => {
    expect((await POST(postRequest({ ...body, name: 'a-clean' }))).status).toBe(
      400,
    )
    expect((await POST(postRequest({ ...body, content: 'nope' }))).status).toBe(
      400,
    )
  })

  it('creates <name>.gpx without overwriting', async () => {
    mockWrite.mockResolvedValue({ path: 'Día 1.gpx' })
    const res = await POST(postRequest(body))
    expect(res.status).toBe(201)
    expect(mockWrite).toHaveBeenCalledWith(
      'Día 1.gpx',
      '<gpx/>',
      'Add Día 1.gpx from the blog track editor',
      { createOnly: true },
    )
    expect(await res.json()).toEqual({ path: 'Día 1.gpx' })
  })

  it('returns 409 when the file exists', async () => {
    mockWrite.mockRejectedValue(new TrackExistsError('Día 1.gpx'))
    const res = await POST(postRequest(body))
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'Día 1.gpx already exists' })
  })

  it('reports a missing token', async () => {
    mockWrite.mockRejectedValue(new MissingGithubTokenError())
    expect((await POST(postRequest(body))).status).toBe(500)
  })

  it('returns 502 when GitHub fails', async () => {
    mockWrite.mockRejectedValue(new Error('boom'))
    expect((await POST(postRequest(body))).status).toBe(502)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

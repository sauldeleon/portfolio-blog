/**
 * @jest-environment node
 */
import { GET, PUT } from './route'

const mockAuth = jest.fn()
const mockRead = jest.fn()
const mockWrite = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
jest.mock('@web/lib/github/tracks', () => {
  const actual = jest.requireActual('@web/lib/github/tracks')
  return {
    ...actual,
    readTrackFile: (...args: unknown[]) => mockRead(...args),
    writeTrackFile: (...args: unknown[]) => mockWrite(...args),
  }
})
jest.mock('@web/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: jest.fn(),
  },
}))

const { MissingGithubTokenError } = jest.requireActual('@web/lib/github/tracks')

function getRequest(path: string | null) {
  const qs = path === null ? '' : `?path=${encodeURIComponent(path)}`
  return new Request(`http://localhost/api/tracks/file${qs}`)
}

function putRequest(body: unknown) {
  return new Request('http://localhost/api/tracks/file', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'admin' } })
})

describe('GET /api/tracks/file', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    expect((await GET(getRequest('a.gpx'))).status).toBe(401)
  })

  it('returns 400 for a missing or invalid path', async () => {
    expect((await GET(getRequest(null))).status).toBe(400)
    expect((await GET(getRequest('../a.gpx'))).status).toBe(400)
  })

  it('returns the file contents', async () => {
    mockRead.mockResolvedValue('<gpx/>')
    const res = await GET(getRequest('Día 1.gpx'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      path: 'Día 1.gpx',
      rawUrl: expect.stringContaining('D%C3%ADa%201.gpx'),
      content: '<gpx/>',
    })
  })

  it('returns 502 when GitHub fails', async () => {
    mockRead.mockRejectedValue(new Error('boom'))
    expect((await GET(getRequest('a.gpx'))).status).toBe(502)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

describe('PUT /api/tracks/file', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PUT(
      putRequest({ sourcePath: 'a.gpx', content: '<gpx/>' }),
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid bodies', async () => {
    expect(
      (await PUT(putRequest({ sourcePath: 'a.txt', content: '<gpx/>' })))
        .status,
    ).toBe(400)
    expect(
      (await PUT(putRequest({ sourcePath: 'a.gpx', content: 'nope' }))).status,
    ).toBe(400)
  })

  it('saves to the -clean sibling', async () => {
    mockWrite.mockResolvedValue({ path: 'a-clean.gpx' })
    const res = await PUT(
      putRequest({ sourcePath: 'a.gpx', content: '<gpx/>' }),
    )
    expect(res.status).toBe(200)
    expect(mockWrite).toHaveBeenCalledWith(
      'a-clean.gpx',
      '<gpx/>',
      'Update a-clean.gpx from the blog track editor',
    )
    expect(await res.json()).toEqual({ path: 'a-clean.gpx' })
  })

  it('reports a missing token', async () => {
    mockWrite.mockRejectedValue(new MissingGithubTokenError())
    const res = await PUT(
      putRequest({ sourcePath: 'a.gpx', content: '<gpx/>' }),
    )
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      error: 'GITHUB_TRACKS_TOKEN is not configured',
    })
  })

  it('returns 502 when GitHub fails', async () => {
    mockWrite.mockRejectedValue(new Error('boom'))
    const res = await PUT(
      putRequest({ sourcePath: 'a.gpx', content: '<gpx/>' }),
    )
    expect(res.status).toBe(502)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

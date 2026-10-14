/**
 * @jest-environment node
 */
import axios, { AxiosError, AxiosHeaders } from 'axios'

import {
  MissingGithubTokenError,
  TrackExistsError,
  isValidTrackPath,
  listTrackFiles,
  rawUrlFor,
  readTrackFile,
  writeTrackFile,
} from './tracks'

jest.mock('axios', () => {
  const actual = jest.requireActual('axios')
  return {
    get: jest.fn(),
    put: jest.fn(),
    isAxiosError: actual.isAxiosError,
    AxiosError: actual.AxiosError,
    AxiosHeaders: actual.AxiosHeaders,
  }
})

const mockGet = jest.mocked(axios.get)
const mockPut = jest.mocked(axios.put)

function notFound() {
  return new AxiosError('Not Found', '404', undefined, undefined, {
    status: 404,
    statusText: 'Not Found',
    data: {},
    headers: {},
    config: { headers: new AxiosHeaders() },
  })
}

const ENV = process.env

beforeEach(() => {
  jest.clearAllMocks()
  process.env = { ...ENV }
  delete process.env.GITHUB_TRACKS_REPO
  delete process.env.GITHUB_TRACKS_BRANCH
  delete process.env.GITHUB_TRACKS_TOKEN
})

afterAll(() => {
  process.env = ENV
})

describe('rawUrlFor', () => {
  it('builds an encoded raw URL for the default repo', () => {
    expect(rawUrlFor('dir/Día 1.gpx')).toBe(
      'https://raw.githubusercontent.com/sauldeleon/gpx/main/dir/D%C3%ADa%201.gpx',
    )
  })

  it('honours the configured repo and branch', () => {
    process.env.GITHUB_TRACKS_REPO = 'me/tracks'
    process.env.GITHUB_TRACKS_BRANCH = 'dev'
    expect(rawUrlFor('a.gpx')).toBe(
      'https://raw.githubusercontent.com/me/tracks/dev/a.gpx',
    )
  })
})

describe('isValidTrackPath', () => {
  it.each([
    ['a.gpx', true],
    ['dir/Día 1.GPX', true],
    ['a.txt', false],
    ['/a.gpx', false],
    ['../a.gpx', false],
    ['dir/./a.gpx', false],
    ['dir//a.gpx', false],
    ['dir\\a.gpx', false],
    [`${'a'.repeat(300)}.gpx`, false],
  ])('%s → %s', (path, valid) => {
    expect(isValidTrackPath(path)).toBe(valid)
  })
})

describe('listTrackFiles', () => {
  it('lists sorted .gpx blobs', async () => {
    mockGet.mockResolvedValue({
      data: {
        tree: [
          { path: 'b.gpx', type: 'blob', size: 10 },
          { path: 'README.md', type: 'blob', size: 1 },
          { path: 'dir', type: 'tree' },
          { path: 'a.gpx', type: 'blob' },
        ],
      },
    })
    await expect(listTrackFiles()).resolves.toEqual({
      files: [
        {
          path: 'a.gpx',
          size: 0,
          rawUrl: 'https://raw.githubusercontent.com/sauldeleon/gpx/main/a.gpx',
        },
        {
          path: 'b.gpx',
          size: 10,
          rawUrl: 'https://raw.githubusercontent.com/sauldeleon/gpx/main/b.gpx',
        },
      ],
      truncated: false,
    })
    expect(mockGet).toHaveBeenCalledWith(
      'https://api.github.com/repos/sauldeleon/gpx/git/trees/main',
      expect.objectContaining({ params: { recursive: 1 } }),
    )
  })

  it('reports a truncated tree', async () => {
    mockGet.mockResolvedValue({ data: { tree: [], truncated: true } })
    await expect(listTrackFiles()).resolves.toEqual({
      files: [],
      truncated: true,
    })
  })

  it('authenticates when a token is configured', async () => {
    process.env.GITHUB_TRACKS_TOKEN = 'secret'
    mockGet.mockResolvedValue({ data: { tree: [] } })
    await listTrackFiles()
    expect(mockGet.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: 'Bearer secret',
    })
  })
})

describe('readTrackFile', () => {
  it('reads the raw file contents through the API', async () => {
    mockGet.mockResolvedValue({ data: '<gpx/>' })
    await expect(readTrackFile('Día 1.gpx')).resolves.toBe('<gpx/>')
    expect(mockGet).toHaveBeenCalledWith(
      'https://api.github.com/repos/sauldeleon/gpx/contents/D%C3%ADa%201.gpx',
      expect.objectContaining({
        params: { ref: 'main' },
        responseType: 'text',
        headers: expect.objectContaining({
          Accept: 'application/vnd.github.raw+json',
        }),
      }),
    )
  })
})

describe('writeTrackFile', () => {
  it('requires a token', async () => {
    await expect(writeTrackFile('a.gpx', '<gpx/>', 'msg')).rejects.toThrow(
      MissingGithubTokenError,
    )
  })

  it('updates an existing file with its sha', async () => {
    process.env.GITHUB_TRACKS_TOKEN = 'secret'
    mockGet.mockResolvedValue({ data: { sha: 'abc' } })
    mockPut.mockResolvedValue({ data: { commit: { sha: 'c1' } } })
    await expect(writeTrackFile('a-clean.gpx', 'ñ', 'msg')).resolves.toEqual({
      path: 'a-clean.gpx',
      rawUrl:
        'https://raw.githubusercontent.com/sauldeleon/gpx/main/a-clean.gpx',
      commitSha: 'c1',
      created: false,
    })
    expect(mockPut).toHaveBeenCalledWith(
      'https://api.github.com/repos/sauldeleon/gpx/contents/a-clean.gpx',
      {
        message: 'msg',
        content: Buffer.from('ñ', 'utf8').toString('base64'),
        branch: 'main',
        sha: 'abc',
      },
      expect.anything(),
    )
  })

  it('creates a missing file without a sha', async () => {
    process.env.GITHUB_TRACKS_TOKEN = 'secret'
    mockGet.mockRejectedValue(notFound())
    mockPut.mockResolvedValue({ data: { commit: { sha: 'c2' } } })
    const saved = await writeTrackFile('a-clean.gpx', '<gpx/>', 'msg')
    expect(saved.created).toBe(true)
    expect(mockPut.mock.calls[0][1]).not.toHaveProperty('sha')
  })

  it('refuses to overwrite in create-only mode', async () => {
    process.env.GITHUB_TRACKS_TOKEN = 'secret'
    mockGet.mockResolvedValue({ data: { sha: 'abc' } })
    await expect(
      writeTrackFile('a.gpx', '<gpx/>', 'msg', { createOnly: true }),
    ).rejects.toThrow(TrackExistsError)
    expect(mockPut).not.toHaveBeenCalled()
  })

  it('creates in create-only mode when missing', async () => {
    process.env.GITHUB_TRACKS_TOKEN = 'secret'
    mockGet.mockRejectedValue(notFound())
    mockPut.mockResolvedValue({ data: { commit: { sha: 'c3' } } })
    const saved = await writeTrackFile('a.gpx', '<gpx/>', 'msg', {
      createOnly: true,
    })
    expect(saved.created).toBe(true)
  })

  it('rethrows unexpected lookup errors', async () => {
    process.env.GITHUB_TRACKS_TOKEN = 'secret'
    mockGet.mockRejectedValue(new Error('boom'))
    await expect(writeTrackFile('a.gpx', '<gpx/>', 'msg')).rejects.toThrow(
      'boom',
    )
    expect(mockPut).not.toHaveBeenCalled()
  })
})

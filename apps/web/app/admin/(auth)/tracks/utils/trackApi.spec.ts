import axios from 'axios'

import {
  editTrackHref,
  fetchTrackFile,
  fetchTrackFiles,
  saveTrackFile,
  trackFileQueryKey,
  uploadTrackFile,
} from './trackApi'

jest.mock('axios', () => ({ get: jest.fn(), put: jest.fn(), post: jest.fn() }))

const mockGet = jest.mocked(axios.get)
const mockPut = jest.mocked(axios.put)
const mockPost = jest.mocked(axios.post)

describe('trackApi', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches the track list', async () => {
    const listing = { files: [{ path: 'a.gpx' }], truncated: false }
    mockGet.mockResolvedValue({ data: listing })
    await expect(fetchTrackFiles()).resolves.toEqual(listing)
    expect(mockGet).toHaveBeenCalledWith('/api/tracks')
  })

  it('fetches a track file', async () => {
    mockGet.mockResolvedValue({ data: { path: 'a.gpx', content: '<gpx/>' } })
    await expect(fetchTrackFile('a.gpx')).resolves.toEqual({
      path: 'a.gpx',
      content: '<gpx/>',
    })
    expect(mockGet).toHaveBeenCalledWith('/api/tracks/file', {
      params: { path: 'a.gpx' },
    })
  })

  it('saves a track file', async () => {
    mockPut.mockResolvedValue({ data: { path: 'a-clean.gpx' } })
    await expect(saveTrackFile('a.gpx', '<gpx/>')).resolves.toEqual({
      path: 'a-clean.gpx',
    })
    expect(mockPut).toHaveBeenCalledWith('/api/tracks/file', {
      sourcePath: 'a.gpx',
      content: '<gpx/>',
    })
  })

  it('uploads a new track', async () => {
    mockPost.mockResolvedValue({ data: { path: 'b.gpx' } })
    await expect(uploadTrackFile('b', '<gpx/>')).resolves.toEqual({
      path: 'b.gpx',
    })
    expect(mockPost).toHaveBeenCalledWith('/api/tracks', {
      name: 'b',
      content: '<gpx/>',
    })
  })

  it('builds keys and links', () => {
    expect(trackFileQueryKey('a.gpx')).toEqual(['admin-track-file', 'a.gpx'])
    expect(editTrackHref('Día 1.gpx')).toBe(
      '/admin/tracks/edit?path=D%C3%ADa%201.gpx',
    )
  })
})

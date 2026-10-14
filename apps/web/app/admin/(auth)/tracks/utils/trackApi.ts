import axios from 'axios'

export interface TrackFile {
  path: string
  size: number
  rawUrl: string
}

export interface TrackListing {
  files: TrackFile[]
  truncated: boolean
}

export interface TrackFileContent {
  path: string
  rawUrl: string
  content: string
}

export interface SavedTrackFile {
  path: string
  rawUrl: string
  commitSha: string
  created: boolean
}

export const TRACKS_QUERY_KEY = ['admin-tracks'] as const

export function trackFileQueryKey(path: string) {
  return ['admin-track-file', path] as const
}

export async function fetchTrackFiles(): Promise<TrackListing> {
  const { data } = await axios.get<TrackListing>('/api/tracks')
  return data
}

export async function fetchTrackFile(path: string): Promise<TrackFileContent> {
  const { data } = await axios.get<TrackFileContent>('/api/tracks/file', {
    params: { path },
  })
  return data
}

export async function saveTrackFile(
  sourcePath: string,
  content: string,
): Promise<SavedTrackFile> {
  const { data } = await axios.put<SavedTrackFile>('/api/tracks/file', {
    sourcePath,
    content,
  })
  return data
}

export async function uploadTrackFile(
  name: string,
  content: string,
): Promise<SavedTrackFile> {
  const { data } = await axios.post<SavedTrackFile>('/api/tracks', {
    name,
    content,
  })
  return data
}

export function editTrackHref(path: string): string {
  return `/admin/tracks/edit?path=${encodeURIComponent(path)}`
}

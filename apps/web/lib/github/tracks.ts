import axios, { isAxiosError } from 'axios'

const API_URL = 'https://api.github.com'
const DEFAULT_REPO = 'sauldeleon/gpx'
const DEFAULT_BRANCH = 'main'

export interface TrackFile {
  path: string
  size: number
  rawUrl: string
}

export interface TrackListing {
  files: TrackFile[]
  /** GitHub cut the tree short (over ~100k entries): the list is incomplete. */
  truncated: boolean
}

export interface SavedTrackFile {
  path: string
  rawUrl: string
  commitSha: string
  created: boolean
}

export class MissingGithubTokenError extends Error {
  constructor() {
    super('GITHUB_TRACKS_TOKEN is not configured')
  }
}

export class TrackExistsError extends Error {
  constructor(path: string) {
    super(`${path} already exists`)
  }
}

function config() {
  return {
    repo: process.env.GITHUB_TRACKS_REPO || DEFAULT_REPO,
    branch: process.env.GITHUB_TRACKS_BRANCH || DEFAULT_BRANCH,
    token: process.env.GITHUB_TRACKS_TOKEN,
  }
}

function headers(accept = 'application/vnd.github+json') {
  const { token } = config()
  return {
    Accept: accept,
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

export function rawUrlFor(path: string): string {
  const { repo, branch } = config()
  return `https://raw.githubusercontent.com/${repo}/${branch}/${encodePath(path)}`
}

/** Relative `.gpx` path inside the repo, with no traversal. */
export function isValidTrackPath(path: string): boolean {
  return (
    /\.gpx$/i.test(path) &&
    path.length <= 300 &&
    !path.startsWith('/') &&
    !path.includes('\\') &&
    !path
      .split('/')
      .some((part) => part === '' || part === '.' || part === '..')
  )
}

export async function listTrackFiles(): Promise<TrackListing> {
  const { repo, branch } = config()
  const { data } = await axios.get<{
    tree: Array<{ path: string; type: string; size?: number }>
    truncated?: boolean
  }>(`${API_URL}/repos/${repo}/git/trees/${encodeURIComponent(branch)}`, {
    params: { recursive: 1 },
    headers: headers(),
  })
  const files = data.tree
    .filter((entry) => entry.type === 'blob' && /\.gpx$/i.test(entry.path))
    .map((entry) => ({
      path: entry.path,
      size: entry.size ?? 0,
      rawUrl: rawUrlFor(entry.path),
    }))
    .sort((a, b) => a.path.localeCompare(b.path))
  return { files, truncated: data.truncated === true }
}

/** Reads a file straight from the API, bypassing the raw CDN cache. */
export async function readTrackFile(path: string): Promise<string> {
  const { repo, branch } = config()
  const { data } = await axios.get<string>(
    `${API_URL}/repos/${repo}/contents/${encodePath(path)}`,
    {
      params: { ref: branch },
      headers: headers('application/vnd.github.raw+json'),
      responseType: 'text',
    },
  )
  return data
}

async function fileSha(path: string): Promise<string | null> {
  const { repo, branch } = config()
  try {
    const { data } = await axios.get<{ sha: string }>(
      `${API_URL}/repos/${repo}/contents/${encodePath(path)}`,
      { params: { ref: branch }, headers: headers() },
    )
    return data.sha
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return null
    throw err
  }
}

export async function writeTrackFile(
  path: string,
  content: string,
  message: string,
  { createOnly = false }: { createOnly?: boolean } = {},
): Promise<SavedTrackFile> {
  const { repo, branch, token } = config()
  if (!token) throw new MissingGithubTokenError()
  const sha = await fileSha(path)
  if (createOnly && sha) throw new TrackExistsError(path)
  const { data } = await axios.put<{ commit: { sha: string } }>(
    `${API_URL}/repos/${repo}/contents/${encodePath(path)}`,
    {
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    },
    { headers: headers() },
  )
  return {
    path,
    rawUrl: rawUrlFor(path),
    commitSha: data.commit.sha,
    created: sha === null,
  }
}

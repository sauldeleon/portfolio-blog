/**
 * @jest-environment node
 */
import { DELETE, PUT } from './route'

const mockAuth = jest.fn()
const mockUpsertSeriesTranslation = jest.fn()
const mockDbSelect = jest.fn()
const mockDbDelete = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
jest.mock('@web/lib/db/queries/series', () => ({
  upsertSeriesTranslation: (...args: unknown[]) =>
    mockUpsertSeriesTranslation(...args),
}))

function makeChain(resolved: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['from', 'where', 'limit']
  for (const m of methods) chain[m] = jest.fn().mockReturnValue(chain)
  chain.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(resolved).then(resolve)
  chain.catch = jest.fn().mockReturnThis()
  chain.finally = jest.fn().mockReturnThis()
  return chain
}

jest.mock('@web/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockDbSelect(...args),
    delete: (...args: unknown[]) => mockDbDelete(...args),
  },
}))
jest.mock('@web/lib/db/schema', () => ({
  posts: {},
  series: {},
  seriesTranslations: {},
}))
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  isNotNull: jest.fn(),
  isNull: jest.fn(),
}))

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

function makeRequest(body: unknown) {
  return new Request(`http://localhost/api/series/my-series`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'admin' } })
})

describe('PUT /api/series/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PUT(
      makeRequest({ locale: 'en', title: 'Title' }),
      makeParams('my-series'),
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/series/my-series', {
      method: 'PUT',
      body: 'bad',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PUT(req, makeParams('my-series'))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid locale', async () => {
    const res = await PUT(
      makeRequest({ locale: 'fr', title: 'Titre' }),
      makeParams('my-series'),
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 for empty title', async () => {
    const res = await PUT(
      makeRequest({ locale: 'en', title: '' }),
      makeParams('my-series'),
    )
    expect(res.status).toBe(400)
  })

  it('upserts translation and returns 200', async () => {
    mockUpsertSeriesTranslation.mockResolvedValue(undefined)
    const res = await PUT(
      makeRequest({ locale: 'en', title: 'My Series' }),
      makeParams('my-series'),
    )
    expect(res.status).toBe(200)
    expect(mockUpsertSeriesTranslation).toHaveBeenCalledWith(
      'my-series',
      'en',
      'My Series',
    )
    const json = await res.json()
    expect(json).toEqual({ id: 'my-series', locale: 'en', title: 'My Series' })
  })
})

describe('DELETE /api/series/[id]', () => {
  const deleteReq = new Request('http://localhost/api/series/my-series', {
    method: 'DELETE',
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await DELETE(deleteReq, makeParams('my-series'))
    expect(res.status).toBe(401)
  })

  it('returns 422 when series has posts', async () => {
    mockDbSelect.mockReturnValue(makeChain([{ id: 'post-1' }]))
    const res = await DELETE(deleteReq, makeParams('my-series'))
    expect(res.status).toBe(422)
  })

  it('deletes series and translations when no posts', async () => {
    const selectChain = makeChain([])
    const deleteChain = makeChain([])
    mockDbSelect.mockReturnValue(selectChain)
    mockDbDelete.mockReturnValue(deleteChain)
    const res = await DELETE(deleteReq, makeParams('my-series'))
    expect(res.status).toBe(200)
    expect(mockDbDelete).toHaveBeenCalledTimes(2)
    const json = await res.json()
    expect(json).toEqual({ id: 'my-series' })
  })
})

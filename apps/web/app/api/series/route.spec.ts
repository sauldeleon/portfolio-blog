/**
 * @jest-environment node
 */
import { GET, POST } from './route'

const mockAuth = jest.fn()
const mockGetSeriesForAdmin = jest.fn()
const mockUpsertSeriesTranslation = jest.fn()
const mockDbSelect = jest.fn()
const mockDbInsert = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
jest.mock('@web/lib/db/queries/series', () => ({
  getSeriesForAdmin: (...args: unknown[]) => mockGetSeriesForAdmin(...args),
  upsertSeriesTranslation: (...args: unknown[]) =>
    mockUpsertSeriesTranslation(...args),
}))
jest.mock('@web/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}))

function makeChain(resolved: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'from', 'where', 'limit', 'insert', 'values']
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
    insert: (...args: unknown[]) => mockDbInsert(...args),
  },
}))
jest.mock('@web/lib/db/schema', () => ({ series: {} }))
jest.mock('drizzle-orm', () => ({ eq: jest.fn() }))

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'admin' } })
})

describe('GET /api/series', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns series list when authenticated', async () => {
    const data = [{ id: 'my-series', postCount: 2, translations: [] }]
    mockGetSeriesForAdmin.mockResolvedValue(data)
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual(data)
  })

  it('returns 500 and logs error when getSeriesForAdmin throws', async () => {
    const err = new Error('DB error')
    mockGetSeriesForAdmin.mockRejectedValue(err)
    const res = await GET()
    expect(res.status).toBe(500)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('Failed to get series')
    expect(mockLoggerError).toHaveBeenCalledWith(err, 'Failed to get series')
  })
})

describe('POST /api/series', () => {
  function makeRequest(body: unknown) {
    return new Request('http://localhost/api/series', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST(makeRequest({ id: 'my-series' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/series', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing id', async () => {
    const selectChain = makeChain([])
    mockDbSelect.mockReturnValue(selectChain)
    const res = await POST(makeRequest({ id: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 409 when series already exists', async () => {
    const selectChain = makeChain([{ id: 'my-series' }])
    mockDbSelect.mockReturnValue(selectChain)
    const res = await POST(makeRequest({ id: 'my-series' }))
    expect(res.status).toBe(409)
  })

  it('creates series and returns 201', async () => {
    const selectChain = makeChain([])
    const insertChain = makeChain([])
    mockDbSelect.mockReturnValue(selectChain)
    mockDbInsert.mockReturnValue(insertChain)
    mockUpsertSeriesTranslation.mockResolvedValue(undefined)
    const res = await POST(makeRequest({ id: 'my-series' }))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.id).toBe('my-series')
  })

  it('upserts EN and ES translations when provided', async () => {
    const selectChain = makeChain([])
    const insertChain = makeChain([])
    mockDbSelect.mockReturnValue(selectChain)
    mockDbInsert.mockReturnValue(insertChain)
    mockUpsertSeriesTranslation.mockResolvedValue(undefined)
    await POST(
      makeRequest({
        id: 'my-series',
        translations: { en: 'My Series', es: 'Mi Serie' },
      }),
    )
    expect(mockUpsertSeriesTranslation).toHaveBeenCalledWith(
      'my-series',
      'en',
      'My Series',
    )
    expect(mockUpsertSeriesTranslation).toHaveBeenCalledWith(
      'my-series',
      'es',
      'Mi Serie',
    )
  })

  it('does not upsert translation when not provided', async () => {
    const selectChain = makeChain([])
    const insertChain = makeChain([])
    mockDbSelect.mockReturnValue(selectChain)
    mockDbInsert.mockReturnValue(insertChain)
    await POST(makeRequest({ id: 'my-series' }))
    expect(mockUpsertSeriesTranslation).not.toHaveBeenCalled()
  })

  it('returns 400 for id with invalid characters', async () => {
    const res = await POST(makeRequest({ id: 'invalid id!' }))
    expect(res.status).toBe(400)
  })

  it('returns 500 and logs error when db.insert throws', async () => {
    const selectChain = makeChain([])
    mockDbSelect.mockReturnValue(selectChain)
    const err = new Error('DB insert error')
    mockDbInsert.mockImplementation(() => {
      throw err
    })
    const res = await POST(makeRequest({ id: 'my-series' }))
    expect(res.status).toBe(500)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('Failed to create series')
    expect(mockLoggerError).toHaveBeenCalledWith(err, 'Failed to create series')
  })
})

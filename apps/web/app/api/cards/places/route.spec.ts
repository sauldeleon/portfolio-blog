/**
 * @vitest-environment node
 */
import { POST } from './route'

const mockAuth = vi.fn()
const mockNameLandmarks = vi.fn()

vi.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
vi.mock('@web/lib/cards/osmLandmarks', () => ({
  nameLandmarksFromOsm: (...args: unknown[]) => mockNameLandmarks(...args),
}))

const PEAK = { kind: 'peak', index: 3, ele: 2417, lat: 43, lon: -5.9 }

function request(body: unknown): Request {
  return new Request('http://localhost/api/cards/places', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'admin' } })
})

describe('POST /api/cards/places', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST(request({ landmarks: [PEAK] }))
    expect(res.status).toBe(401)
    expect(mockNameLandmarks).not.toHaveBeenCalled()
  })

  it('returns 400 for landmarks without coordinates', async () => {
    const res = await POST(request({ landmarks: [{ kind: 'peak' }] }))
    expect(res.status).toBe(400)
  })

  it('names the landmarks from OpenStreetMap', async () => {
    const named = { landmarks: [{ ...PEAK, name: 'Peña Ubiña' }] }
    mockNameLandmarks.mockResolvedValue({ ...named, unavailable: false })
    const res = await POST(request({ landmarks: [{ ...PEAK, hidden: true }] }))
    expect(res.status).toBe(200)
    expect(mockNameLandmarks).toHaveBeenCalledWith([{ ...PEAK, hidden: true }])
    expect(await res.json()).toEqual({
      data: { ...named, unavailable: false },
    })
  })
})

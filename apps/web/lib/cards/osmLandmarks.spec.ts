import { OVERPASS_URLS, nameLandmarksFromOsm } from './osmLandmarks'
import type { RouteLandmark } from './types'

const PEAK: RouteLandmark = {
  kind: 'peak',
  index: 3,
  ele: 2417,
  lat: 43,
  lon: -5.9,
}
const COL: RouteLandmark = {
  kind: 'col',
  index: 5,
  ele: 1950,
  lat: 43.01,
  lon: -5.9,
}

// ~0.0005° of latitude ≈ 55 m.
const ELEMENTS = [
  { lat: 43.0005, lon: -5.9, tags: { name: 'Peña Ubiña', natural: 'peak' } },
  {
    lat: 43.0002,
    lon: -5.9,
    tags: { name: 'Collado cerca', natural: 'saddle' },
  },
  { lat: 43.0105, lon: -5.9, tags: { name: 'El Ronzón', natural: 'saddle' } },
  { lat: 43.0101, lon: -5.9, tags: { name: 'Puerto', mountain_pass: 'yes' } },
  { lat: 43.02, lon: -5.9, tags: { name: 'Lejos', natural: 'saddle' } },
  { lat: 43.0001, lon: -5.9 },
  { lat: 43.0001, lon: -5.9, tags: { name: 'Lago', natural: 'water' } },
]

function ok(elements: unknown) {
  return { ok: true, json: async () => ({ elements }) } as Response
}

describe('nameLandmarksFromOsm', () => {
  it('names each landmark after the closest feature of its kind', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok(ELEMENTS))
    const result = await nameLandmarksFromOsm([PEAK, COL], fetchImpl)
    expect(result.unavailable).toBe(false)
    expect(result.landmarks.map((l) => l.name)).toEqual([
      'Peña Ubiña',
      'Puerto',
    ])
    // Every server is asked at once.
    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual(OVERPASS_URLS)
    expect(decodeURIComponent(fetchImpl.mock.calls[0][1].body)).toContain(
      'node(around:150,43,-5.9)["natural"~"^(peak|volcano|saddle)$"]["name"]',
    )
  })

  it('keeps existing names and skips the request when all are named', async () => {
    const fetchImpl = vi.fn()
    const named = [{ ...PEAK, name: 'Mine' }]
    expect(await nameLandmarksFromOsm(named, fetchImpl)).toEqual({
      landmarks: named,
      unavailable: false,
    })
    expect(fetchImpl).not.toHaveBeenCalled()

    fetchImpl.mockResolvedValue(ok(ELEMENTS))
    const mixed = await nameLandmarksFromOsm(
      [{ ...PEAK, name: 'Mine' }, COL],
      fetchImpl,
    )
    expect(mixed.landmarks.map((l) => l.name)).toEqual(['Mine', 'Puerto'])
  })

  it('leaves landmarks unnamed when nothing is close enough', async () => {
    const far = { ...COL, lat: 43.5 }
    const fetchImpl = vi.fn().mockResolvedValue(ok(ELEMENTS))
    expect((await nameLandmarksFromOsm([far], fetchImpl)).landmarks).toEqual([
      far,
    ])
  })

  it('takes the first server that answers', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 502 } as Response)
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(ok(ELEMENTS))
      .mockResolvedValueOnce(ok([]))
    const result = await nameLandmarksFromOsm([PEAK], fetchImpl)
    expect(result).toEqual({
      landmarks: [{ ...PEAK, name: 'Peña Ubiña' }],
      unavailable: false,
    })
  })

  it('says so when no server answers', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('not json')
        },
      } as unknown as Response)
      .mockResolvedValueOnce({ ok: false, status: 429 } as Response)
    expect(await nameLandmarksFromOsm([PEAK], fetchImpl)).toEqual({
      landmarks: [PEAK],
      unavailable: true,
    })
  })

  it('copes with a reply without elements', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
    expect((await nameLandmarksFromOsm([PEAK], fetchImpl)).landmarks).toEqual([
      PEAK,
    ])
  })

  it('uses the global fetch by default', async () => {
    const original = global.fetch
    global.fetch = vi.fn().mockResolvedValue(ok(ELEMENTS))
    try {
      const { landmarks } = await nameLandmarksFromOsm([PEAK])
      expect(landmarks[0].name).toBe('Peña Ubiña')
    } finally {
      global.fetch = original
    }
  })
})

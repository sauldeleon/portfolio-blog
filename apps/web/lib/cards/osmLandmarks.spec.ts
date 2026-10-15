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
    const fetchImpl = jest.fn().mockResolvedValue(ok(ELEMENTS))
    const named = await nameLandmarksFromOsm([PEAK, COL], fetchImpl)
    expect(named.map((l) => l.name)).toEqual(['Peña Ubiña', 'Puerto'])
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe(OVERPASS_URLS[0])
    expect(decodeURIComponent(init.body)).toContain(
      'node(around:150,43,-5.9)["natural"~"^(peak|volcano|saddle)$"]["name"]',
    )
  })

  it('keeps existing names and skips the request when all are named', async () => {
    const fetchImpl = jest.fn()
    const named = [{ ...PEAK, name: 'Mine' }]
    expect(await nameLandmarksFromOsm(named, fetchImpl)).toBe(named)
    expect(fetchImpl).not.toHaveBeenCalled()

    fetchImpl.mockResolvedValue(ok(ELEMENTS))
    const mixed = await nameLandmarksFromOsm(
      [{ ...PEAK, name: 'Mine' }, COL],
      fetchImpl,
    )
    expect(mixed.map((l) => l.name)).toEqual(['Mine', 'Puerto'])
  })

  it('leaves landmarks unnamed when nothing is close enough', async () => {
    const far = { ...COL, lat: 43.5 }
    const fetchImpl = jest.fn().mockResolvedValue(ok(ELEMENTS))
    expect(await nameLandmarksFromOsm([far], fetchImpl)).toEqual([far])
  })

  it('falls back to the mirror when the main server fails', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce(ok(ELEMENTS))
    const named = await nameLandmarksFromOsm([PEAK], fetchImpl)
    expect(named[0].name).toBe('Peña Ubiña')
    expect(fetchImpl.mock.calls[1][0]).toBe(OVERPASS_URLS[1])
  })

  it('gives up quietly when every server fails', async () => {
    const fetchImpl = jest
      .fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('not json')
        },
      } as unknown as Response)
    expect(await nameLandmarksFromOsm([PEAK], fetchImpl)).toEqual([PEAK])
  })

  it('copes with a reply without elements', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
    expect(await nameLandmarksFromOsm([PEAK], fetchImpl)).toEqual([PEAK])
  })

  it('uses the global fetch by default', async () => {
    const original = global.fetch
    global.fetch = jest.fn().mockResolvedValue(ok(ELEMENTS))
    try {
      const named = await nameLandmarksFromOsm([PEAK])
      expect(named[0].name).toBe('Peña Ubiña')
    } finally {
      global.fetch = original
    }
  })
})

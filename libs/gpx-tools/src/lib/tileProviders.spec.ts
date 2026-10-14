import { TILE_PROVIDERS } from './tileProviders'

describe('TILE_PROVIDERS', () => {
  it('defines OSM, topo and satellite layers', () => {
    expect(TILE_PROVIDERS.map((p) => p.id)).toEqual([
      'osm',
      'topo',
      'satellite',
    ])
    TILE_PROVIDERS.forEach((p) => {
      expect(p.url).toMatch(/^https:\/\//)
      expect(p.maxZoom).toBeGreaterThan(0)
    })
  })
})

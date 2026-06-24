// `renderCard` is a pure SVG renderer, not a Testing Library render helper, so
// naming its result `svg` is correct here.

/* eslint-disable testing-library/render-result-naming-convention */
import { renderCard } from './renderCard'
import type { CardSpec } from './types'

describe('renderCard', () => {
  it('dispatches canyoning-data to canyoningCard', () => {
    const spec: CardSpec = { kind: 'canyoning-data', lang: 'es' }
    const svg = renderCard(spec)
    expect(svg).toContain('<svg')
    expect(svg).toContain('BARRANCO')
  })

  it('returns a non-empty SVG string', () => {
    const spec: CardSpec = { kind: 'canyoning-data', lang: 'en', title: 'Test' }
    const svg = renderCard(spec)
    expect(svg.length).toBeGreaterThan(100)
  })

  it('dispatches summary-route to summaryCard', () => {
    const spec: CardSpec = { kind: 'summary-route', lang: 'es' }
    const svg = renderCard(spec)
    expect(svg).toContain('<svg')
    expect(svg).toContain('RESUMEN DE RUTA')
  })

  it('dispatches summary-ferrata to summaryCard', () => {
    const spec: CardSpec = { kind: 'summary-ferrata', lang: 'es' }
    const svg = renderCard(spec)
    expect(svg).toContain('<svg')
    expect(svg).toContain('VÍA FERRATA')
  })

  it('dispatches summary-canyoning to summaryCard', () => {
    const spec: CardSpec = { kind: 'summary-canyoning', lang: 'es' }
    const svg = renderCard(spec)
    expect(svg).toContain('<svg')
    expect(svg).toContain('BARRANCO')
  })
})

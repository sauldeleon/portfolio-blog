import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { SummaryFerrataData } from '@web/lib/cards'

import { FerrataSummaryMap } from './FerrataSummaryMap'

function data(overrides: Partial<SummaryFerrataData> = {}): SummaryFerrataData {
  return { kind: 'summary-ferrata', lang: 'en', grade: 'K3', ...overrides }
}

describe('FerrataSummaryMap', () => {
  it('renders the card and a single difficulty zone', () => {
    renderApp(<FerrataSummaryMap data={data()} />)
    expect(screen.getByTestId('card-svg')).toBeInTheDocument()
    expect(screen.getByTestId('card-zone-ferrata-grade')).toBeInTheDocument()
  })

  it('opens the K-scale on hover with the current grade active', () => {
    renderApp(<FerrataSummaryMap data={data()} />)
    fireEvent.mouseEnter(screen.getByTestId('card-zone-ferrata-grade'))
    const pop = screen.getByTestId('card-popover')
    expect(pop).toHaveAttribute('data-open', 'true')
    expect(pop).toHaveTextContent('Difficulty scale')
    expect(screen.getByTestId('ferrata-scale-K1')).toBeInTheDocument()
    expect(screen.getByTestId('ferrata-scale-K6')).toBeInTheDocument()
    expect(screen.getByTestId('ferrata-scale-K3')).toHaveTextContent('Moderate')
  })

  it('localises the scale to Spanish', () => {
    renderApp(<FerrataSummaryMap data={data({ lang: 'es' })} />)
    fireEvent.mouseEnter(screen.getByTestId('card-zone-ferrata-grade'))
    expect(screen.getByTestId('card-popover')).toHaveTextContent(
      'Escala de dificultad',
    )
  })

  it('renders the zone even without a grade', () => {
    renderApp(<FerrataSummaryMap data={data({ grade: undefined })} />)
    fireEvent.click(screen.getByTestId('card-zone-ferrata-grade'))
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('supports click-only mode', () => {
    renderApp(<FerrataSummaryMap data={data()} interaction="click" />)
    const zone = screen.getByTestId('card-zone-ferrata-grade')
    fireEvent.mouseEnter(zone)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'false',
    )
    fireEvent.click(zone)
    expect(screen.getByTestId('card-popover')).toHaveAttribute(
      'data-open',
      'true',
    )
  })
})

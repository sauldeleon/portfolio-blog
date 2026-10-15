import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { SummaryRouteData } from '@web/lib/cards'

import { RouteSummaryMap } from './RouteSummaryMap'

function data(overrides: Partial<SummaryRouteData> = {}): SummaryRouteData {
  return {
    kind: 'summary-route',
    lang: 'en',
    title: 'Peña Ubiña',
    elevation: [1100, 2417, 1900, 2200, 1100],
    ...overrides,
  }
}

describe('RouteSummaryMap', () => {
  it('renders the card with altitude on the profile and no zones', () => {
    renderApp(<RouteSummaryMap data={data()} />)
    expect(screen.getByTestId('card-svg')).toBeInTheDocument()
    expect(screen.getByTestId('card-profile-layer')).toBeInTheDocument()
    expect(screen.getByTestId('card-peak-1')).toHaveAttribute(
      'aria-label',
      '2,417 m',
    )
    expect(screen.queryByTestId(/^card-zone-/)).not.toBeInTheDocument()
    expect(screen.getByTestId('card-hint')).toHaveTextContent(
      'Hover or tap the profile to see the altitude',
    )
  })

  it('localises the hint and the altitudes', () => {
    renderApp(<RouteSummaryMap data={data({ lang: 'es' })} />)
    expect(screen.getByTestId('card-hint')).toHaveTextContent(
      'Pasa el ratón o el dedo por el perfil',
    )
    expect(screen.getByTestId('card-peak-1')).toHaveAttribute(
      'aria-label',
      '2417 m',
    )
  })

  it('has no profile layer or hint without elevation', () => {
    renderApp(<RouteSummaryMap data={data({ elevation: undefined })} />)
    expect(screen.queryByTestId('card-profile-layer')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-hint')).not.toBeInTheDocument()
  })
})

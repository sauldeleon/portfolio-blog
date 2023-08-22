import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Portals } from './Portals'

jest.mock('./components/Particles/Particles', () => ({
  Particles: () => <div>ParticlesMock</div>,
}))

describe('Portals', () => {
  it('should render only the portals with no items and neither particles but with a surrounding cylinder', () => {
    renderWithTheme(<Portals items={[]} enableCylinder />)

    expect(screen.getByRole('presentation')).toBeInTheDocument()
    const portals = screen.getAllByText('portal.svg')
    expect(portals).toHaveLength(2)
    expect(portals[0]).toHaveAttribute('color', '#FFDD83')
    expect(portals[1]).toHaveAttribute('color', '#98DFD6')
    expect(screen.getByTestId('cylinder-wrapper')).toBeInTheDocument()
  })

  it('should render particles and items and hide selected items', async () => {
    renderWithTheme(
      <Portals
        items={[
          { svg: <svg /> },
          { svg: <svg /> },
          { isHidden: true, svg: <svg /> },
        ]}
        enableParticles
      />
    )

    expect(screen.getAllByTestId('horizontal-movement').length).toBe(2)
    expect(screen.getByText('ParticlesMock')).toBeInTheDocument()
  })
})

import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Portals } from './Portals'

jest.mock('./components/Particles/Particles', () => ({
  Particles: () => <div>ParticlesMock</div>,
}))

describe('Portals', () => {
  it('should render only the portals with no items and neither particles but with a surrounding cylinder', () => {
    renderWithTheme(<Portals enableCylinder />)

    expect(screen.getByRole('presentation')).toBeInTheDocument()
    const portals = screen.getAllByText('portal.svg')
    expect(portals).toHaveLength(2)
    expect(portals[0]).toHaveAttribute('color', '#FFDD83')
    expect(portals[1]).toHaveAttribute('color', '#98DFD6')
    expect(screen.getByTestId('cylinder-wrapper')).toBeInTheDocument()
  })

  it('should render particles and children and hide selected items', async () => {
    renderWithTheme(<Portals enableParticles>test</Portals>)

    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('ParticlesMock')).toBeInTheDocument()
  })
})

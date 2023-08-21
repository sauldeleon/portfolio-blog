import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Portals } from './Portals'

jest.mock('@sdlgr/use-container-dimensions', () => ({
  useContainerDimensions: jest.fn().mockReturnValue({ width: 1, height: 1 }),
}))

jest.mock('@web/components/HardcoreParticles/HardcoreParticles', () => ({
  HardcoreParticles: () => <div>ParticlesMock</div>,
}))

describe('Portals', () => {
  it('should render only the portals with no items and neither particles', () => {
    renderWithTheme(<Portals items={[]} enableCylinder />)

    const portals = screen.getAllByText('portal.svg')
    expect(portals).toHaveLength(2)
    expect(portals[0]).toHaveAttribute('color', '#FFDD83')
    expect(portals[1]).toHaveAttribute('color', '#98DFD6')
  })

  it('should render particles and items and hide selected items', async () => {
    renderWithTheme(
      <Portals
        items={[
          { seed: 'wadus', path: '/test.jpg' },
          { seed: 'wadus', path: '/test.jpg' },
          { seed: 'wadus', isHidden: true, path: '/test.jpg' },
        ]}
        enableParticles
      />
    )

    expect(screen.getAllByRole('presentation').length).toBe(2)
    expect(screen.getByText('ParticlesMock')).toBeInTheDocument()
  })
})

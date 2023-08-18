import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Portals } from './Portals'

const mockSeeds = {
  keyframe: 'keyframe',
  verticalStartPoint: 'verticalStartPoint',
  horizontalDuration: 'horizontalDuration',
  horizontalDelay: 'horizontalDelay',
  verticalZIndex: 'verticalZIndex',
  verticalDuration: 'verticalDuration',
  verticalDelay: 'verticalDelay',
  verticalRange: 'verticalRange',
  verticalColor: 'verticalColor',
  rotationZIndex: 'rotationZIndex',
  rotationColor: 'rotationColor',
  rotationDuration: 'rotationDuration',
  rotationDelay: 'rotationDelay',
}

jest.mock('./HardcoreParticles', () => ({
  HardcoreParticles: () => <div>ParticlesMock</div>,
}))

describe('Portals', () => {
  it('should render only the portals with no items and neither particles', () => {
    renderWithTheme(<Portals items={[]} />)

    const portals = screen.getAllByText('portal.svg')
    expect(portals).toHaveLength(2)
    expect(portals[0]).toHaveAttribute('color', '#FFDD83')
    expect(portals[1]).toHaveAttribute('color', '#98DFD6')
  })

  it('should render particles and items and hide selected items', () => {
    renderWithTheme(
      <Portals
        items={[
          { id: 1, seeds: mockSeeds, path: '/test.jpg' },
          { id: 2, seeds: mockSeeds, path: '/test.jpg' },
          { id: 2, seeds: mockSeeds, isHidden: true, path: '/test.jpg' },
        ]}
      />
    )

    expect(screen.getAllByRole('presentation').length).toBe(2)
    expect(screen.getByText('ParticlesMock')).toBeInTheDocument()
  })
})

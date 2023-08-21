import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Particles } from './Particles'

describe('Particles', () => {
  it('should render successfully', () => {
    renderWithTheme(<Particles />)
    expect(screen.getAllByRole('presentation')).toHaveLength(50)
  })

  it('should override particles number', () => {
    renderWithTheme(<Particles numParticles={100} />)
    expect(screen.getAllByRole('presentation')).toHaveLength(100)
  })
})

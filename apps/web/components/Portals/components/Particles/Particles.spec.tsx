import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Particles } from './Particles'

describe('Particles', () => {
  it('should render successfully', () => {
    renderWithTheme(<Particles />)
    expect(screen.getByRole('presentation')).toBeInTheDocument()
  })

  it('should override particles number', () => {
    renderWithTheme(<Particles numParticles={60} />)
    const parentContainer = screen.getByRole('presentation')
    // eslint-disable-next-line testing-library/no-node-access
    expect(parentContainer.childElementCount).toBe(60)
  })
})

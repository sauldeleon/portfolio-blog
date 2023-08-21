import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { HardcoreParticles } from './HardcoreParticles'

describe('HardcoreParticles', () => {
  it('should render successfully', () => {
    renderWithTheme(<HardcoreParticles parentWidth={100} parentHeight={300} />)
    expect(screen.getAllByRole('presentation')).toHaveLength(50)
  })

  it('should override particles number', () => {
    renderWithTheme(
      <HardcoreParticles
        parentWidth={100}
        parentHeight={300}
        numParticles={100}
      />
    )
    expect(screen.getAllByRole('presentation')).toHaveLength(100)
  })
})

import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { SoftParticles } from './SoftParticles'

describe('SoftParticles', () => {
  it('should render successfully with 100 particles', () => {
    renderWithTheme(<SoftParticles parentWidth={100} parentHeight={200} />)

    expect(screen.getAllByRole('presentation')).toHaveLength(3)
    expect(screen.getAllByRole('presentation')[0]).toHaveStyleRule(
      'box-shadow',
      expect.stringMatching(/0px 0px #fff(,\d+px \d+px #fff){100}/)
    )
  })

  it('should override particle number successfully', () => {
    renderWithTheme(
      <SoftParticles parentWidth={100} parentHeight={200} numParticles={200} />
    )

    expect(screen.getAllByRole('presentation')[0]).toHaveStyleRule(
      'box-shadow',
      expect.stringMatching(/0px 0px #fff(,\d+px \d+px #fff){200}/)
    )
  })
})

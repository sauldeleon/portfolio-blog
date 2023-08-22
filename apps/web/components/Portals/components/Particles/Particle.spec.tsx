import { renderWithTheme } from '@sdlgr/test-utils'

import { Particle } from './Particle'

describe('Particles', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(<Particle />)
    expect(baseElement).toMatchSnapshot()
  })
})

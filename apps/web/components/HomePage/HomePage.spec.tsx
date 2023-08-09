import { renderApp } from '@sdlgr/test-utils'

import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<HomePage />)
    expect(baseElement).toMatchSnapshot()
  })
})

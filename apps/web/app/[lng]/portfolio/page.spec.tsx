import { renderApp } from '@sdlgr/test-utils'

import Page from './page.next'

describe('[lng]/portfolio route -  page', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<Page />)
    expect(baseElement).toBeTruthy()
  })
})

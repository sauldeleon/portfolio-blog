import { renderApp } from '@sdlgr/test-utils'

import Page from './page.next'

describe('[lng]/blog route -  page', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<Page />)
    expect(baseElement).toBeTruthy()
  })
})

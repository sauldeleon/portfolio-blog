import { renderApp } from '@sdlgr/test-utils'

import Page from './page.next'

describe('[lng]/get-in-touch route -  page', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<Page />)
    expect(baseElement).toBeTruthy()
  })
})

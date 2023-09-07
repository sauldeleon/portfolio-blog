import { renderApp } from '@sdlgr/test-utils'

import { BlogPage } from './BlogPage'

describe('BlogPage', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<BlogPage />)
    expect(baseElement).toBeTruthy()
  })
})

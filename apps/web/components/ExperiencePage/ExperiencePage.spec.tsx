import { renderApp } from '@sdlgr/test-utils'

import { ExperiencePage } from './ExperiencePage'

describe('ExperiencePage', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<ExperiencePage />)
    expect(baseElement).toBeTruthy()
  })
})

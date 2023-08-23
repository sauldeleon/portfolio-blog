import { renderApp } from '@sdlgr/test-utils'

import { ContactPage } from './ContactPage'

describe('ContactPage', () => {
  it('should render', () => {
    const { baseElement } = renderApp(<ContactPage />)
    expect(baseElement).toMatchSnapshot()
  })
})

import { renderApp } from '@sdlgr/test-utils'

import Page, { generateMetadata } from './page.next'

describe('[lng]/portfolio route -  page', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<Page />)
    expect(baseElement).toBeTruthy()
  })
})

describe('[lng]/contact - Metadata', () => {
  it('should set the correct metadata', async () => {
    expect(await generateMetadata({ params: { lng: 'en' } })).toEqual({
      description: 'Portfolio',
    })
  })
})

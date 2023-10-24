import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page, { generateMetadata } from './page.next'

describe('[lng]/experience route -  page', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Page />)
    await screen.findByText('Experience')
    expect(baseElement).toMatchSnapshot()
  })
})

describe('[lng]/contact - Metadata', () => {
  it('should set the correct metadata', async () => {
    expect(await generateMetadata({ params: { lng: 'en' } })).toEqual({
      description: 'My work experience',
    })
  })
})

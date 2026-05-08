import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page, { generateMetadata } from './page.next'

describe('[lng]/experience route -  page', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(
      await Page({ params: Promise.resolve({ lng: 'en' }) }),
    )
    await screen.findByText('Experience')
    expect(baseElement).toMatchSnapshot()
  })

  it('should render successfully in Spanish', async () => {
    const { baseElement } = renderApp(
      await Page({ params: Promise.resolve({ lng: 'es' }) }),
    )
    expect(baseElement).toBeTruthy()
  })
})

describe('[lng]/contact - Metadata', () => {
  it('should set the correct metadata', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'en' }) }),
    ).toEqual({
      description: 'My work experience',
    })
  })
})

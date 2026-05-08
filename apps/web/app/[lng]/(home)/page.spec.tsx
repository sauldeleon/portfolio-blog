import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page from './page.next'

describe('[lng] route - Page', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(
      await Page({ params: Promise.resolve({ lng: 'en' }) }),
    )
    const items = await screen.findAllByRole('presentation')
    expect(items).toHaveLength(2)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render successfully in Spanish', async () => {
    const { baseElement } = renderApp(
      await Page({ params: Promise.resolve({ lng: 'es' }) }),
    )
    expect(baseElement).toBeTruthy()
  })
})

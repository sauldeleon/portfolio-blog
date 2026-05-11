import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { ExperiencePage } from './ExperiencePage'

describe('ExperiencePage', () => {
  it('should render successfully in English', async () => {
    const { baseElement } = renderApp(await ExperiencePage({ lng: 'en' }))
    await screen.findByText('Experience')
    expect(baseElement).toMatchSnapshot()
  })

  it('should render successfully in Spanish', async () => {
    const { baseElement } = renderApp(await ExperiencePage({ lng: 'es' }))
    await screen.findByText('Experiencia')
    expect(baseElement).toBeTruthy()
  })
})

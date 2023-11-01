import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { ExperiencePage } from './ExperiencePage'

describe('ExperiencePage', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<ExperiencePage />)
    await screen.findByText('Experience')
    expect(baseElement).toMatchSnapshot()
  })
})

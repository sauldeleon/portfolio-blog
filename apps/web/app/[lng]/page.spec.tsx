import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page from './page.next'

describe('Page', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Page />)
    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Saúl de León Guerrero')
    expect(baseElement).toMatchSnapshot()
  })
})

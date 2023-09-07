import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { NotFound } from './not-found.next'

describe('NotFound', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<NotFound />)
    await screen.findByText('404')
    expect(baseElement).toMatchSnapshot()
  })
})

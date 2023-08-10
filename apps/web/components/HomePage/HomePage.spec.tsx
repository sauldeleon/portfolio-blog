import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<HomePage />)
    await screen.findByRole('heading', { level: 1 })
    expect(baseElement).toMatchSnapshot()
  })
})

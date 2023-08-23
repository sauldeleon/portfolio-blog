import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('should render successfully', async () => {
    renderApp(<HomePage />)
    const items = await screen.findAllByRole('presentation')
    expect(items.length).toBe(2)
  })
})

import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page from './page.next'

describe('[lng] route - Page', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Page />)
    const items = await screen.findAllByRole('presentation')
    expect(items).toHaveLength(2)
    expect(baseElement).toMatchSnapshot()
  })
})

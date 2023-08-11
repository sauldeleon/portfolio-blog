import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { Layout } from './Layout'

describe('Layout', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Layout>test</Layout>)
    await screen.findByText('test')
    expect(baseElement).toMatchSnapshot()
  })
})

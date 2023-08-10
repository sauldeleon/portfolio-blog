import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { Layout } from './Layout'

describe('Layout', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Layout>test</Layout>)
    await screen.findByRole('navigation')
    expect(baseElement).toMatchSnapshot()
  })

  it('should render a header with 3 links', async () => {
    renderApp(<Layout>test</Layout>)
    const nav = await screen.findByRole('navigation')
    expect(nav).toBeTruthy()
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })
})

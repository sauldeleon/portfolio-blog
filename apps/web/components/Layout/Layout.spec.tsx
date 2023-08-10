import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { Layout } from './Layout'

describe('Layout', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<Layout>test</Layout>)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render a header with 3 links', () => {
    renderApp(<Layout>test</Layout>)
    expect(screen.getByRole('navigation')).toBeTruthy()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })
})

import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import HomeLayout from './layout.next'

describe('/[lng]/(home) - HomeLayout', () => {
  it('should render', async () => {
    const { baseElement } = renderApp(<HomeLayout>test</HomeLayout>)
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })
})

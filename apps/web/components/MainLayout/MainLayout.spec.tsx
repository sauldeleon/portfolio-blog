import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { MainLayout } from './MainLayout'

describe('MainLayout', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<MainLayout>test</MainLayout>)
    await screen.findByText('test')
    expect(baseElement).toMatchSnapshot()
  })
})

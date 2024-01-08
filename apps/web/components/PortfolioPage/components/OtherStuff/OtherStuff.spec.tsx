import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { OtherStuff } from './OtherStuff'

describe('OtherStuff', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<OtherStuff />)
    expect(await screen.findByText('Bachelor thesis')).toBeInTheDocument()

    expect(baseElement).toMatchSnapshot()
  })
})

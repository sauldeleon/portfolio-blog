import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { ProfileInfo } from './ProfileInfo'

describe('ProfileInfo', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<ProfileInfo />)
    expect(await screen.findByText('Skills')).toBeInTheDocument()

    expect(baseElement).toMatchSnapshot()
  })
})

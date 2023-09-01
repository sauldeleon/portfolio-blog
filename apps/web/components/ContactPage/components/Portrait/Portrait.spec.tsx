import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { Portrait } from './Portrait'

describe('Portrait', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Portrait onClick={() => void 0} />)
    await screen.findAllByAltText('My profile picture')
    expect(baseElement).toMatchSnapshot()
  })
})

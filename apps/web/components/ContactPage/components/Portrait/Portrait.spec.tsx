import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { Portrait } from './Portrait'

describe('Portrait', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Portrait onClick={() => void 0} />)
    const alternateImages = await screen.findAllByAltText(
      /Saúl de León Guerrero, portrait/,
    )
    expect(alternateImages).toHaveLength(6)
    expect(baseElement).toMatchSnapshot()
  })
})

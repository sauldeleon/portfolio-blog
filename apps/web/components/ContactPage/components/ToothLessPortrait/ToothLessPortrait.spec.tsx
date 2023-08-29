import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { ToothLessPortrait } from './ToothLessPortrait'

describe('ToothLessPortrait', () => {
  it('should render', async () => {
    const { baseElement } = renderApp(
      <ToothLessPortrait onClick={() => void 0} />
    )
    await screen.findByAltText('My toothless profile picture')
    expect(baseElement).toMatchSnapshot()
  })
})

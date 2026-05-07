import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { OtherStuff } from './OtherStuff'

describe('OtherStuff', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<OtherStuff />)
    expect(await screen.findByText('Bachelor thesis')).toBeInTheDocument()

    expect(baseElement).toMatchSnapshot()
  })

  it('should render empty when otherItems is not an array', () => {
    jest
      .spyOn(require('@web/i18n/client'), 'useClientTranslation')
      .mockReturnValue({
        t: () => 'not-an-array',
      })
    const { baseElement } = renderApp(<OtherStuff />)
    expect(baseElement).toBeTruthy()
    jest.restoreAllMocks()
  })
})

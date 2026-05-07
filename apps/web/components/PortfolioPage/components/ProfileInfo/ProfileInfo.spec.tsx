import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { ProfileInfo } from './ProfileInfo'

describe('ProfileInfo', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<ProfileInfo />)
    expect(await screen.findByText('Skills')).toBeInTheDocument()

    expect(baseElement).toMatchSnapshot()
  })

  it('should render empty when areas is not an array', () => {
    jest
      .spyOn(require('@web/i18n/client'), 'useClientTranslation')
      .mockReturnValue({
        t: () => 'not-an-array',
      })
    const { baseElement } = renderApp(<ProfileInfo />)
    expect(baseElement).toBeTruthy()
    jest.restoreAllMocks()
  })
})

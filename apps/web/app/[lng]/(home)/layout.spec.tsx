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

  it('should render with non-array summary', () => {
    jest
      .spyOn(require('@web/i18n/client'), 'useClientTranslation')
      .mockReturnValue({
        t: () => 'not-an-array',
      })
    const { baseElement } = renderApp(<HomeLayout>test</HomeLayout>)
    expect(baseElement).toBeTruthy()
    jest.restoreAllMocks()
  })
})

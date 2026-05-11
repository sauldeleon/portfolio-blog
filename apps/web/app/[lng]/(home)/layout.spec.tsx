import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import HomeLayout from './layout.next'

describe('/[lng]/(home) - HomeLayout', () => {
  it('should render', async () => {
    const { baseElement } = renderApp(
      await HomeLayout({
        children: 'test',
        params: Promise.resolve({ lng: 'en' }),
      }),
    )
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render with non-array summary', async () => {
    jest
      .spyOn(require('@web/i18n/server'), 'getServerTranslation')
      .mockResolvedValue({ t: () => 'not-an-array' })

    const { baseElement } = renderApp(
      await HomeLayout({
        children: 'test',
        params: Promise.resolve({ lng: 'en' }),
      }),
    )
    expect(baseElement).toBeTruthy()
    jest.restoreAllMocks()
  })
})

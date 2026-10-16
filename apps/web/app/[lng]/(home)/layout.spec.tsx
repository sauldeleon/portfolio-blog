import { screen } from '@testing-library/react'
import type { TFunction } from 'i18next'

import { renderApp } from '@sdlgr/test-utils'

import type { getServerTranslation } from '@web/i18n/server'

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
    vi.spyOn(
      await import('@web/i18n/server'),
      'getServerTranslation',
    ).mockResolvedValue({
      t: (() => 'not-an-array') as unknown as TFunction,
    } as Awaited<ReturnType<typeof getServerTranslation>>)

    const { baseElement } = renderApp(
      await HomeLayout({
        children: 'test',
        params: Promise.resolve({ lng: 'en' }),
      }),
    )
    expect(baseElement).toBeTruthy()
    vi.restoreAllMocks()
  })
})

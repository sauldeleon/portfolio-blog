import React from 'react'

import { renderApp } from '@sdlgr/test-utils'

import { ProgressBar } from './ProgressBar'

vi.mock('react', async () => ({
  ...(await vi.importActual<typeof import('react')>('react')),
  Suspense: ({ children }: { children: React.ReactNode }) => children,
}))

describe('ProgressBar', () => {
  it('should render', async () => {
    const { baseElement } = renderApp(<ProgressBar />)
    expect(baseElement).toMatchSnapshot()
  })
})

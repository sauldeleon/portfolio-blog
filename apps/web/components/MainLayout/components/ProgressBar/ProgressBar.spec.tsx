import React from 'react'

import { renderApp } from '@sdlgr/test-utils'

import { ProgressBar } from './ProgressBar'

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: ({ children }: { children: React.ReactNode }) => children,
}))

describe('ProgressBar', () => {
  it('should render', async () => {
    const { baseElement } = renderApp(<ProgressBar />)
    expect(baseElement).toMatchSnapshot()
  })
})
